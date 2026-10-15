<?php
/**
 * SambaBrasilChannel - Image & File Upload Proxy
 * Handles image uploads, validates types, uploads to Backblaze B2 via S3 SigV4,
 * and returns Cloudflare CDN URLs (minimizing egress fees).
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// 1. Load Configuration
$configPath = __DIR__ . '/config/b2_credentials.php';
$config = file_exists($configPath) ? require $configPath : [];

$cdnBaseUrl    = rtrim(getenv('B2_CDN_URL') ?: ($config['cdn_base_url'] ?? 'https://cdn.sambabrasilchannel.com.ar'), '/');
$b2KeyId       = getenv('B2_KEY_ID') ?: ($config['key_id'] ?? '');
$b2AppKey      = getenv('B2_APPLICATION_KEY') ?: ($config['application_key'] ?? '');
$b2BucketName  = getenv('B2_BUCKET_NAME') ?: ($config['bucket_name'] ?? 'SambaBrasil');
$b2Region      = getenv('B2_REGION') ?: ($config['region'] ?? 'us-west-004');
$b2Endpoint    = getenv('B2_ENDPOINT') ?: ($config['endpoint'] ?? 's3.us-west-004.backblazeb2.com');

if (empty($b2KeyId) || empty($b2AppKey) || empty($b2BucketName)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Storage credentials not configured']);
    exit();
}

// 2. Verify File Payload
if (!isset($_FILES['file']) && !isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file received in request']);
    exit();
}

$uploadedFile = $_FILES['file'] ?? $_FILES['image'];

if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Upload error code: ' . $uploadedFile['error']]);
    exit();
}

// 3. Validate File Type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
finfo_close($finfo);

$allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'
];

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File type not allowed: ' . $mimeType]);
    exit();
}

// 4. Generate Object Key
$folder = isset($_POST['folder']) ? preg_replace('/[^a-zA-Z0-9_\-\/]/', '', $_POST['folder']) : 'uploads';
$folder = trim($folder, '/');
if (empty($folder)) {
    $folder = 'uploads';
}

$extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
if (empty($extension)) {
    $mimeMap = [
        'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
        'image/gif' => 'gif', 'image/svg+xml' => 'svg', 'video/mp4' => 'mp4'
    ];
    $extension = $mimeMap[$mimeType] ?? 'bin';
}

$filename = uniqid('sbc_', true) . '.' . strtolower($extension);
$objectKey = $folder ? "{$folder}/{$filename}" : $filename;

// 5. Upload via S3 SigV4 to Backblaze B2
$fileData = file_get_contents($uploadedFile['tmp_name']);
$uploadSuccess = uploadSigV4($b2Endpoint, $b2BucketName, $b2Region, $b2KeyId, $b2AppKey, $objectKey, $fileData, $mimeType, $errorMsg);

if ($uploadSuccess) {
    $cdnUrl = "{$cdnBaseUrl}/{$objectKey}";
    echo json_encode([
        'success'    => true,
        'url'        => $cdnUrl,
        'object_key' => $objectKey,
        'filename'   => $filename,
        'mime'       => $mimeType,
        'size'       => strlen($fileData),
    ]);
    exit();
} else {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to upload to Backblaze B2',
        'details' => $errorMsg
    ]);
    exit();
}

/**
 * AWS Signature Version 4 PUT object to Backblaze B2 S3 API
 */
function uploadSigV4($host, $bucket, $region, $accessKey, $secretKey, $objectKey, $payload, $mimeType, &$errorMsg = '') {
    $service = 's3';
    $timestamp = time();
    $amzDate = gmdate('Ymd\THis\Z', $timestamp);
    $dateStamp = gmdate('Ymd', $timestamp);

    $payloadHash = hash('sha256', $payload);
    $uri = '/' . rawurlencode($bucket) . '/' . implode('/', array_map('rawurlencode', explode('/', $objectKey)));

    $canonicalHeaders = "host:{$host}\nx-amz-content-sha256:{$payloadHash}\nx-amz-date:{$amzDate}\n";
    $signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    $canonicalRequest = "PUT\n"
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
        "Authorization: {$authorizationHeader}",
        "Content-Type: {$mimeType}",
        "Content-Length: " . strlen($payload)
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

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
