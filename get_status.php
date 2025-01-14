<?php
header('Content-Type: application/json');

$apiKey = 'APIKEY';
$deviceId = 'DEVICEID';
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
