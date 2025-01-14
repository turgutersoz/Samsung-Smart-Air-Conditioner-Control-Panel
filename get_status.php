<?php
header('Content-Type: application/json');


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

$apiUrl = "https://api.smartthings.com/v1/devices/{$deviceId}/status";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
curl_close($ch);
$deviceStatus = json_decode($response, true);

$data = [
    'temperature' => isset($deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value']) ? 
        $deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value'] : null,
    'humidity' => isset($deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value']) ? 
        $deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value'] : null
];

echo json_encode($data); 
