<?php
header('Content-Type: application/json');

$apiKey = '1662e7f8-d431-40f1-aee7-c463a3956d84';
$deviceId = 'bc19bc8d-9cc5-9668-a802-cbe6ad246b58';
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