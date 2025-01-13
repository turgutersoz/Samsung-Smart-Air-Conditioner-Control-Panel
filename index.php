<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akıllı Klima Kontrol Paneli</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        body {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            padding: 20px 0;
            position: relative;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('https://i.imgur.com/8TuR5W3.png') repeat;
            opacity: 0.1;
            pointer-events: none;
            z-index: 0;
        }
        .container {
            position: relative;
            z-index: 1;
        }
        .card {
            margin-top: 20px;
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
        }
        .card-header {
            background: linear-gradient(135deg, #0062E6, #33AEFF);
            color: white;
            border-radius: 15px 15px 0 0 !important;
            padding: 1.5rem;
            border-bottom: none;
        }
        .status-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .status-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .mode-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border-radius: 10px !important;
            margin: 5px;
            padding: 15px !important;
            background: rgba(255,255,255,0.9);
            border: 1px solid rgba(13,110,253,0.2);
        }
        .mode-btn.active {
            background: linear-gradient(135deg, #0062E6, #33AEFF);
            color: white;
            border: none;
        }
        .mode-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .power-btn {
            width: 100%;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 15px;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .power-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .gauge-container {
            position: relative;
            height: 250px;
            margin: 10px 0;
            background: rgba(255,255,255,0.5);
            border-radius: 15px;
            padding: 10px;
        }
        .temp-btn {
            width: 50px;
            height: 50px;
            border-radius: 25px;
            border: none;
            background: linear-gradient(135deg, #0062E6, #33AEFF);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .temp-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .temp-display {
            font-size: 2.5rem;
            font-weight: bold;
            color: #0d6efd;
            min-width: 100px;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h4 {
            color: #1e3c72;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .status-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #0d6efd;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .loading {
            position: relative;
            pointer-events: none;
        }
        .loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 15px;
        }
        .loading::before {
            content: '↻';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            color: #0d6efd;
            z-index: 1;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Mevcut durum kartı stilleri */
        .current-status {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }

        .current-status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            padding: 1rem 0;
        }

        .status-item {
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }

        .status-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .status-label {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }

        .status-item .status-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0d6efd;
        }

        #currentPowerStatus {
            font-size: 1.2rem;
            padding: 0.3rem 1rem;
            border-radius: 20px;
            display: inline-block;
        }

        #currentPowerStatus.active {
            background-color: #198754;
            color: white;
        }

        #currentPowerStatus.inactive {
            background-color: #dc3545;
            color: white;
        }

        /* Detaylı durum kartı stilleri */
        .table-responsive {
            margin-top: 1rem;
        }

        .table {
            margin-bottom: 0;
        }

        .table td {
            vertical-align: middle;
            padding: 0.75rem;
        }

        .table td:first-child {
            width: 40%;
            font-weight: 500;
        }

        .table td:last-child {
            text-align: right;
        }

        .badge {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            font-weight: 500;
        }

        #detailPower.badge {
            min-width: 80px;
        }
    </style>
</head>
<body>
<?php
require_once 'config.php';

function sendCommand($command, $capability, $argument) {
    global $apiKey, $deviceId;
    $commandUrl = "https://api.smartthings.com/v1/devices/{$deviceId}/commands";
    
    $data = [
        'commands' => [
            [
                'component' => 'main',
                'capability' => $capability,
                'command' => $command,
                'arguments' => [$argument]
            ]
        ]
    ];

    $ch = curl_init($commandUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['power'])) {
        $powerCommand = $_POST['power'] == 'on' ? 'on' : 'off';
        $data = [
            'commands' => [
                [
                    'component' => 'main',
                    'capability' => 'switch',
                    'command' => $powerCommand,
                    'arguments' => []
                ]
            ]
        ];

        $ch = curl_init($commandUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
    }
    if (isset($_POST['mode'])) {
        sendCommand('setAirConditionerMode', 'airConditionerMode', $_POST['mode']);
    }
    if (isset($_POST['temperature'])) {
        sendCommand('setCoolingSetpoint', 'thermostatCoolingSetpoint', (int)$_POST['temperature']);
    }
    if (isset($_POST['optionalMode'])) {
        sendCommand('setAcOptionalMode', 'custom.airConditionerOptionalMode', $_POST['optionalMode']);
    }
}

// Cihaz durumunu daha detaylı almak için
$ch = curl_init($apiUrl . "/status");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey
]);
$response = curl_exec($ch);
curl_close($ch);
$deviceStatus = json_decode($response, true);

// Değişkenleri tanımla
$powerStatus = isset($deviceStatus['components']['main']['switch']['switch']['value']) ? 
               $deviceStatus['components']['main']['switch']['switch']['value'] : 'off';

$currentMode = isset($deviceStatus['components']['main']['airConditionerMode']['airConditionerMode']['value']) ? 
               $deviceStatus['components']['main']['airConditionerMode']['airConditionerMode']['value'] : 'auto';

$temperature = isset($deviceStatus['components']['main']['temperatureMeasurement']['temperature']['value']) ? 
               $deviceStatus['components']['main']['temperatureMeasurement']['temperature']['value'] : null;

$setTemperature = isset($deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value']) ? 
                  $deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value'] : null;

$humidity = isset($deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value']) ? 
            $deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value'] : null;

$optionalModes = isset($deviceStatus['components']['main']['custom.airConditionerOptionalMode']['supportedAcOptionalMode']['value']) ? 
                 $deviceStatus['components']['main']['custom.airConditionerOptionalMode']['supportedAcOptionalMode']['value'] : [];

$currentOptionalMode = isset($deviceStatus['components']['main']['custom.airConditionerOptionalMode']['acOptionalMode']['value']) ? 
                      $deviceStatus['components']['main']['custom.airConditionerOptionalMode']['acOptionalMode']['value'] : null;

// Debug için cihaz durumunu yazdıralım
error_log(print_r($deviceStatus, true));
?>

<div class="container">
    <div class="card">
        <div class="card-header">
            <h2><i class="fas fa-snowflake me-2"></i>Akıllı Klima Kontrol Paneli</h2>
        </div>
        <div class="card-body">
            <form id="climateForm" method="post">
                <div class="row">
                    <div class="col-12 mb-4">
                        <button type="submit" name="power" value="<?php echo $powerStatus === 'on' ? 'off' : 'on'; ?>" 
                                class="power-btn btn <?php echo $powerStatus === 'on' ? 'btn-danger' : 'btn-success'; ?>">
                            <i class="fas fa-power-off me-2"></i><?php echo $powerStatus === 'on' ? 'Klimayı Kapat' : 'Klimayı Aç'; ?>
                        </button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 mb-4">
                        <div class="status-card current-status">
                            <h4><i class="fas fa-info-circle me-2"></i>Mevcut Durum</h4>
                            <div class="current-status-grid">
                                <div class="status-item">
                                    <div class="status-label">
                                        <i class="fas fa-power-off me-2"></i>Durum
                                    </div>
                                    <div class="status-value">
                                        <span id="currentPowerStatus" class="<?php echo $powerStatus === 'on' ? 'active' : 'inactive'; ?>">
                                            <?php echo $powerStatus === 'on' ? 'AÇIK' : 'KAPALI'; ?>
                                        </span>
                                    </div>
                                </div>
                                <div class="status-item">
                                    <div class="status-label">
                                        <i class="fas fa-sliders-h me-2"></i>Çalışma Modu
                                    </div>
                                    <div class="status-value" id="currentMode">
                                        <?php 
                                        $modTranslations = [
                                            'auto' => 'Otomatik',
                                            'cool' => 'Soğutma',
                                            'heat' => 'Isıtma',
                                            'dry' => 'Nem Alma',
                                            'wind' => 'Fan'
                                        ];
                                        echo isset($modTranslations[$currentMode]) ? $modTranslations[$currentMode] : $currentMode;
                                        ?>
                                    </div>
                                </div>
                                <div class="status-item">
                                    <div class="status-label">
                                        <i class="fas fa-thermometer-half me-2"></i>Oda Sıcaklığı
                                    </div>
                                    <div class="status-value" id="currentTemp">
                                        <?php echo isset($temperature) ? number_format($temperature, 1) . '°C' : '--°C'; ?>
                                    </div>
                                </div>
                                <div class="status-item">
                                    <div class="status-label">
                                        <i class="fas fa-thermometer-half me-2"></i>Ayarlanan Sıcaklık
                                    </div>
                                    <div class="status-value" id="currentSetTemp">
                                        <?php echo isset($setTemperature) ? number_format($setTemperature, 1) . '°C' : '--°C'; ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="status-card">
                            <h4><i class="fas fa-thermometer-half me-2"></i>Sıcaklık</h4>
                            <div class="gauge-container" id="tempGauge"></div>
                            <div class="temp-control">
                                <button type="button" class="temp-btn" onclick="adjustTemp(-1)">-</button>
                                <div class="temp-display" id="tempDisplay">
                                    <?php echo isset($deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value']) ? 
                                        $deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value'] : '--'; ?>°C
                                </div>
                                <button type="button" class="temp-btn" onclick="adjustTemp(1)">+</button>
                                <input type="hidden" name="temperature" id="tempInput" value="24">
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mb-4">
                        <div class="status-card">
                            <h4><i class="fas fa-tint me-2"></i>Nem Oranı</h4>
                            <div class="gauge-container" id="humidityGauge"></div>
                            <div class="text-center mt-3">
                                <span class="status-value" id="humidityValue">
                                    <?php echo isset($deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value']) ? 
                                        $deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value'] . '%' : '--%'; ?>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mb-4">
                        <div class="status-card">
                            <h4><i class="fas fa-sliders-h me-2"></i>Mod Seçimi</h4>
                            <div class="d-grid gap-2">
                                <?php
                                $currentMode = isset($deviceStatus['components']['main']['airConditionerMode']['airConditionerMode']['value']) ? 
                                    $deviceStatus['components']['main']['airConditionerMode']['airConditionerMode']['value'] : '';
                                $modes = [
                                    'auto' => ['icon' => 'magic', 'text' => 'Otomatik'],
                                    'cool' => ['icon' => 'snowflake', 'text' => 'Soğutma'],
                                    'heat' => ['icon' => 'sun', 'text' => 'Isıtma'],
                                    'dry' => ['icon' => 'tint-slash', 'text' => 'Nem Alma'],
                                    'wind' => ['icon' => 'fan', 'text' => 'Fan']
                                ];
                                foreach ($modes as $mode => $details) {
                                    $activeClass = ($mode == $currentMode) ? 'active' : '';
                                    echo "<button type='submit' name='mode' value='$mode' 
                                        class='btn btn-outline-primary mode-btn $activeClass'>
                                        <i class='fas fa-{$details['icon']} me-2'></i>{$details['text']}
                                    </button>";
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 mb-4">
                        <div class="status-card">
                            <h4><i class="fas fa-star me-2"></i>Opsiyonel Modlar</h4>
                            <div class="d-flex flex-wrap gap-2">
                                <?php
                                if (isset($deviceStatus['components']['main']['custom.airConditionerOptionalMode']['supportedAcOptionalMode']['value'])) {
                                    $optionalModes = $deviceStatus['components']['main']['custom.airConditionerOptionalMode']['supportedAcOptionalMode']['value'];
                                    $currentOptionalMode = isset($deviceStatus['components']['main']['custom.airConditionerOptionalMode']['acOptionalMode']['value']) ?
                                        $deviceStatus['components']['main']['custom.airConditionerOptionalMode']['acOptionalMode']['value'] : '';
                                    foreach ($optionalModes as $mode) {
                                        $activeClass = ($mode == $currentOptionalMode) ? 'active' : '';
                                        echo "<button type='submit' name='optionalMode' value='$mode' 
                                            class='btn btn-outline-secondary mode-btn $activeClass'>
                                            <i class='fas fa-toggle-on me-2'></i>" . ucfirst($mode) . "
                                        </button>";
                                    }
                                } else {
                                    echo '<div class="alert alert-info">Opsiyonel modlar bulunamadı.</div>';
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// Sıcaklık göstergesi
var tempOptions = {
    series: [<?php echo isset($deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value']) ? 
        $deviceStatus['components']['main']['thermostatCoolingSetpoint']['coolingSetpoint']['value'] : 0; ?>],
    chart: {
        type: 'radialBar',
        height: 250,
    },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: {
                margin: 0,
                size: '70%',
            },
            track: {
                background: '#e7e7e7',
                strokeWidth: '97%',
                margin: 5,
            },
            dataLabels: {
                show: true,
                name: {
                    show: true,
                    fontSize: '16px',
                    fontFamily: undefined,
                    color: undefined,
                    offsetY: 120
                },
                value: {
                    show: false,
                }
            }
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: ['#0dcaf0'],
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
        }
    },
    stroke: {
        lineCap: 'round'
    },
    labels: ['Sıcaklık']
};

// Nem göstergesi
var humidityOptions = {
    series: [<?php echo isset($deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value']) ? 
        $deviceStatus['components']['main']['relativeHumidityMeasurement']['humidity']['value'] : 0; ?>],
    chart: {
        type: 'radialBar',
        height: 250,
    },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: {
                margin: 0,
                size: '70%',
            },
            track: {
                background: '#e7e7e7',
                strokeWidth: '97%',
                margin: 5,
            },
            dataLabels: {
                show: true,
                name: {
                    show: true,
                    fontSize: '16px',
                    fontFamily: undefined,
                    color: undefined,
                    offsetY: 120
                },
                value: {
                    show: false,
                }
            }
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: ['#0dcaf0'],
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
        }
    },
    stroke: {
        lineCap: 'round'
    },
    labels: ['Nem']
};

var tempChart = new ApexCharts(document.querySelector("#tempGauge"), tempOptions);
var humidityChart = new ApexCharts(document.querySelector("#humidityGauge"), humidityOptions);

tempChart.render();
humidityChart.render();

// Yükleniyor göstergesi
function showLoading() {
    $('.status-card').addClass('loading');
}

function hideLoading() {
    $('.status-card').removeClass('loading');
}

// Otomatik yenileme fonksiyonu
function refreshData() {
    showLoading();
    $.ajax({
        url: 'get_status.php',
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function(data) {
            console.log('Gelen veri:', data); // Debug için

            // Sıcaklık güncelleme
            if (data.temperature !== null) {
                $('#tempDisplay').text(data.temperature + '°C');
                tempChart.updateSeries([parseFloat(data.temperature)]);
                console.log('Sıcaklık güncellendi:', data.temperature);
            }
            
            // Nem güncelleme
            if (data.humidity !== null) {
                $('#humidityValue').text(data.humidity + '%');
                humidityChart.updateSeries([parseFloat(data.humidity)]);
                console.log('Nem güncellendi:', data.humidity);
            }
        },
        error: function(xhr, status, error) {
            console.error('Hata:', error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

// İlk yükleme
$(document).ready(function() {
    refreshData(); // Sayfa yüklendiğinde ilk veriyi al
    // Her 15 saniyede bir yenile
    setInterval(refreshData, 15000);
});

function adjustTemp(change) {
    var tempDisplay = document.getElementById('tempDisplay');
    var tempInput = document.getElementById('tempInput');
    var currentTemp = parseInt(tempDisplay.innerText);
    
    if (isNaN(currentTemp)) currentTemp = 24;
    
    var newTemp = currentTemp + change;
    if (newTemp >= 16 && newTemp <= 30) {
        tempDisplay.innerText = newTemp + '°C';
        tempInput.value = newTemp;
        tempChart.updateSeries([newTemp]);
        
        // Form gönder
        document.getElementById('climateForm').submit();
    }
}
</script>

</body>
</html> 