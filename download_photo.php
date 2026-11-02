<?php
/**
 * SambaBrasilChannel - CORS & Download Proxy
 * Fetches images from Backblaze B2 / Cloudflare CDN or local uploads
 * and serves them with full CORS headers and download support.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Expose-Headers: Content-Disposition, Content-Length');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$url = $_GET['url'] ?? '';
$filename = $_GET['filename'] ?? '';
$isAttachment = isset($_GET['download']) && $_GET['download'] === '1';

if (empty($url)) {
    http_response_code(400);
    echo 'URL parameter missing';
    exit();
}

// Support relative URLs (e.g. /uploads/...)
if (substr($url, 0, 1) === '/') {
    $localFile = __DIR__ . $url;
    if (file_exists($localFile) && is_file($localFile)) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $localFile);
        finfo_close($finfo);

        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($localFile));
        header('Cache-Control: public, max-age=86400');
        if ($isAttachment) {
            $safeName = $filename ?: basename($localFile);
            $cleanName = preg_replace('/[^\w\-\.\s]/', '_', $safeName);
            header('Content-Disposition: attachment; filename="' . addslashes($cleanName) . '"; filename*=UTF-8\'\'' . rawurlencode($safeName));
        }
        readfile($localFile);
        exit();
    }
}

// Security: Only allow URLs from our own domain, our Cloudflare CDN, or Backblaze B2
$parsed = parse_url($url);
$host = strtolower($parsed['host'] ?? '');
$allowedHosts = [
    'cdn.sambabrasilchannel.com.ar',
    'sambabrasilchannel.com.ar',
    'www.sambabrasilchannel.com.ar',
    's3.us-west-004.backblazeb2.com',
    'images.unsplash.com'
];

if (!in_array($host, $allowedHosts) && !empty($host)) {
    http_response_code(403);
    echo 'Host not allowed';
    exit();
}

// Fetch via cURL with streaming to client
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300 && $data !== false) {
    header('Content-Type: ' . ($contentType ?: 'image/jpeg'));
    header('Content-Length: ' . strlen($data));
    header('Cache-Control: public, max-age=86400');
    if ($isAttachment) {
        $safeName = $filename ?: basename(parse_url($url, PHP_URL_PATH) ?: 'foto.jpg');
        $cleanName = preg_replace('/[^\w\-\.\s]/', '_', $safeName);
        header('Content-Disposition: attachment; filename="' . addslashes($cleanName) . '"; filename*=UTF-8\'\'' . rawurlencode($safeName));
    }
    echo $data;
    exit();
} else {
    http_response_code($httpCode ?: 502);
    echo 'Error fetching remote asset: HTTP ' . $httpCode;
    exit();
}
