<?php
/**
 * SambaBrasilChannel - Image Deletion Proxy (Backblaze B2 & Local Storage)
 * Deletes photos from Backblaze B2 via S3 SigV4 and removes local fallback files.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// 1. Load Configuration
$configPath = __DIR__ . '/config/b2_credentials.php';
$config = file_exists($configPath) ? require $configPath : [];

$cdnBaseUrl    = rtrim(getenv('B2_CDN_URL') ?: ($config['cdn_base_url'] ?? 'https://cdn.sambabrasilchannel.com.ar'), '/');
$b2KeyId       = getenv('B2_KEY_ID') ?: ($config['key_id'] ?? '00429a18a8ece8c000000000c');
$b2AppKey      = getenv('B2_APPLICATION_KEY') ?: ($config['application_key'] ?? 'K00492I8qtI6cd9mZuD9PhS6lvWoXGw');
$b2BucketName  = getenv('B2_BUCKET_NAME') ?: ($config['bucket_name'] ?? 'SambaBrasil');
$b2Region      = getenv('B2_REGION') ?: ($config['region'] ?? 'us-west-004');
$b2Endpoint    = getenv('B2_ENDPOINT') ?: ($config['endpoint'] ?? 's3.us-west-004.backblazeb2.com');

// 2. Parse Input Payload (Supports single URL or array of URLs for bulk deletion)
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$targets = [];
if (!empty($input['urls']) && is_array($input['urls'])) {
    $targets = $input['urls'];
} elseif (!empty($_POST['urls']) && is_array($_POST['urls'])) {
    $targets = $_POST['urls'];
} else {
    $single = $_POST['url'] ?? $_POST['key'] ?? $input['url'] ?? $input['key'] ?? $_GET['url'] ?? $_GET['key'] ?? '';
    if (!empty($single)) {
        $targets = [$single];
    }
}

if (empty($targets)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'URL, key or urls array missing']);
    exit();
}

$results = [];
$totalDeleted = 0;

foreach ($targets as $target) {
    if (empty($target) || !is_string($target)) continue;

    $objectKey = $target;

    // Strip query string if present
    if (($qPos = strpos($objectKey, '?')) !== false) {
        $objectKey = substr($objectKey, 0, $qPos);
    }

    // Match CDN URL or generic URL
    if (strpos($objectKey, $cdnBaseUrl) === 0) {
        $objectKey = substr($objectKey, strlen($cdnBaseUrl));
    } elseif (preg_match('#https?://[^/]+/(.+)#', $objectKey, $matches)) {
        $objectKey = $matches[1];
    }

    $objectKey = ltrim($objectKey, '/');

    // Security check: Prevent directory traversal
    if (strpos($objectKey, '..') !== false) {
        $results[] = ['object_key' => $objectKey, 'success' => false, 'error' => 'Invalid object key'];
        continue;
    }

    $b2Deleted = false;
    $localDeleted = false;
    $errorMsg = '';

    // Check if local fallback file exists and delete it
    $localPath = __DIR__ . '/' . $objectKey;
    if (file_exists($localPath) && is_file($localPath)) {
        @unlink($localPath);
        $localDeleted = true;
    }

    // Delete from Backblaze B2 via S3 SigV4
    $b2Deleted = deleteSigV4($b2Endpoint, $b2BucketName, $b2Region, $b2KeyId, $b2AppKey, $objectKey, $errorMsg);

    $isSuccess = $b2Deleted || $localDeleted;
    if ($isSuccess) $totalDeleted++;

    $results[] = [
        'object_key'    => $objectKey,
        'b2_deleted'    => $b2Deleted,
        'local_deleted' => $localDeleted,
        'success'       => $isSuccess,
        'details'       => $errorMsg ?: 'Deleted successfully'
    ];
}

// Response
$isSingle = count($targets) === 1;
if ($isSingle) {
    $res = $results[0] ?? ['success' => false];
    echo json_encode([
        'success'       => $res['success'] ?? false,
        'object_key'    => $res['object_key'] ?? '',
        'b2_deleted'    => $res['b2_deleted'] ?? false,
        'local_deleted' => $res['local_deleted'] ?? false,
        'details'       => $res['details'] ?? ''
    ]);
} else {
    echo json_encode([
        'success'       => $totalDeleted > 0,
        'total'         => count($targets),
        'deleted_count' => $totalDeleted,
        'results'       => $results
    ]);
}
exit();

/**
 * AWS Signature Version 4 DELETE object to Backblaze B2 S3 API
 */
function deleteSigV4($host, $bucket, $region, $accessKey, $secretKey, $objectKey, &$errorMsg = '') {
    $service = 's3';
    $timestamp = time();
    $amzDate = gmdate('Ymd\THis\Z', $timestamp);
    $dateStamp = gmdate('Ymd', $timestamp);

    $payloadHash = hash('sha256', '');
    $uri = '/' . rawurlencode($bucket) . '/' . implode('/', array_map('rawurlencode', explode('/', $objectKey)));

    $canonicalHeaders = "host:{$host}\nx-amz-content-sha256:{$payloadHash}\nx-amz-date:{$amzDate}\n";
    $signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    $canonicalRequest = "DELETE\n"
        . $uri . "\n"
        . "\n"
        . $canonicalHeaders
        . "\n"
        . $signedHeaders . "\n"
        . $payloadHash;

    $algorithm = 'AWS4-HMAC-SHA256';
    $credentialScope = "{$dateStamp}/{$region}/{$service}/aws4_request";
    $stringToSign = "{$algorithm}\n{$amzDate}\n{$credentialScope}\n" . hash('sha256', $canonicalRequest);

    $kSecret = 'AWS4' . $secretKey;
    $kDate = hash_hmac('sha256', $dateStamp, $kSecret, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);

    $signature = hash_hmac('sha256', $stringToSign, $kSigning);
    $authorizationHeader = "{$algorithm} Credential={$accessKey}/{$credentialScope}, SignedHeaders={$signedHeaders}, Signature={$signature}";

    $url = "https://{$host}{$uri}";

    $headers = [
        "Host: {$host}",
        "x-amz-date: {$amzDate}",
        "x-amz-content-sha256: {$payloadHash}",
        "Authorization: {$authorizationHeader}"
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return true;
    }

    $errorMsg = "HTTP {$httpCode} - {$response} - {$curlErr}";
    return false;
}

