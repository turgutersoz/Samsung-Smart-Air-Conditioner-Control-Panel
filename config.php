<?php
function loadEnv() {
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    } else {
        die('.env dosyası bulunamadı!');
    }
}

// .env dosyasını yükle
loadEnv();

// API bilgilerini al
$apiKey = getenv('SMARTTHINGS_API_KEY');
$deviceId = getenv('SMARTTHINGS_DEVICE_ID');

// API bilgilerinin kontrolü
if (!$apiKey || !$deviceId) {
    die('API anahtarı veya cihaz ID\'si bulunamadı! Lütfen .env dosyasını kontrol edin.');
} 