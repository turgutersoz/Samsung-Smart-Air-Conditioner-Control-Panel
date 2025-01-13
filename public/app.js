// jQuery yükleme kontrolü
document.addEventListener('DOMContentLoaded', function() {
    if (typeof jQuery === 'undefined') {
        console.error('jQuery yüklenemedi!');
        return;
    }

    // Sıcaklık göstergesi
    let tempOptions = {
        series: [0],
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
                gradientToColors: ['#ABE5A1'],
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
    let humidityOptions = {
        series: [0],
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

    // Chart'ları oluştur
    let temperatureChart = new ApexCharts(document.querySelector("#tempGauge"), tempOptions);
    let humidityChart = new ApexCharts(document.querySelector("#humidityGauge"), humidityOptions);

    temperatureChart.render();
    humidityChart.render();

    // Yükleniyor göstergesi
    function showLoading() {
        $('.status-card').addClass('loading');
    }

    function hideLoading() {
        $('.status-card').removeClass('loading');
    }

    // API çağrıları
    async function sendCommand(command, capability, argument = null) {
        try {
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command, capability, argument })
            });
            return await response.json();
        } catch (error) {
            console.error('Komut hatası:', error);
        }
    }

    // Durumu güncelle
    function refreshData() {
        $.get('/api/status')
            .done(function(data) {
                console.log('Frontend API yanıtı:', data);

                // Sıcaklık ve nem değerlerini güncelle
                if (data.temperature !== null && typeof data.temperature === 'number' && !isNaN(data.temperature)) {
                    $('#detailRoomTemp').text(data.temperature.toFixed(1) + '°C');
                    temperatureChart.updateSeries([Math.round(data.temperature)]);
                    $('#tempDisplay').text(data.temperature.toFixed(1));
                } else {
                    $('#detailRoomTemp').text('--°C');
                    temperatureChart.updateSeries([0]);
                    $('#tempDisplay').text('--');
                }

                if (data.setTemperature !== null && typeof data.setTemperature === 'number' && !isNaN(data.setTemperature)) {
                    $('#detailSetTemp').text(data.setTemperature.toFixed(1) + '°C');
                } else {
                    $('#detailSetTemp').text('--°C');
                }

                if (data.humidity !== null && typeof data.humidity === 'number' && !isNaN(data.humidity)) {
                    $('#detailHumidity').text(data.humidity.toFixed(1) + '%');
                    $('#humidityValue').text(data.humidity.toFixed(1) + '%');
                    humidityChart.updateSeries([Math.round(data.humidity)]);
                } else {
                    $('#detailHumidity').text('--%');
                    $('#humidityValue').text('--%');
                    humidityChart.updateSeries([0]);
                }

                // Güç durumunu güncelle
                const powerStatus = data.power === 'on';
                $('#powerBtn')
                    .removeClass('btn-success btn-danger')
                    .addClass(powerStatus ? 'btn-danger' : 'btn-success')
                    .html(`<i class="fas fa-power-off me-2"></i>${powerStatus ? 'Klimayı Kapat' : 'Klimayı Aç'}`);
                
                $('#detailPower')
                    .text(powerStatus ? 'AÇIK' : 'KAPALI')
                    .removeClass('text-success text-danger')
                    .addClass(powerStatus ? 'text-success' : 'text-danger');

                // Çalışma modunu güncelle
                const modeTranslations = {
                    'auto': 'Otomatik',
                    'cool': 'Soğutma',
                    'heat': 'Isıtma',
                    'dry': 'Nem Alma',
                    'wind': 'Fan'
                };
                const translatedMode = data.mode ? (modeTranslations[data.mode] || data.mode) : '--';
                $('#detailMode').text(translatedMode);

                // Opsiyonel modları güncelle
                if (Array.isArray(data.optionalModes) && data.optionalModes.length > 0) {
                    const optionalModesHtml = data.optionalModes.map(mode => {
                        const isActive = data.currentOptionalMode === mode;
                        return `
                            <button class="btn ${isActive ? 'btn-success' : 'btn-outline-primary'} m-1 optional-mode-btn" 
                                    data-mode="${mode}" onclick="toggleOptionalMode('${mode}')">
                                ${mode}
                            </button>
                        `;
                    }).join('');
                    $('#optionalModes').html(optionalModesHtml);
                    
                    // Özel mod durumunu güncelle
                    $('#detailOptionalMode').text(data.currentOptionalMode || '--');
                } else {
                    $('#optionalModes').html('<p class="text-muted">Opsiyonel mod bulunmuyor</p>');
                    $('#detailOptionalMode').text('--');
                }

                // Durum alanını güncelle
                $('#currentStatus').text(powerStatus ? 'AÇIK' : 'KAPALI')
                    .removeClass('text-success text-danger')
                    .addClass(powerStatus ? 'text-success' : 'text-danger');

                // Mod butonlarını güncelle
                $('.mode-btn').removeClass('active');
                $(`.mode-btn[data-mode="${data.mode}"]`).addClass('active');
            })
            .fail(function(error) {
                console.error('Veri alma hatası:', error);
                console.error('Hata detayları:', error.responseJSON);
                
                // Hata durumunda tüm değerleri -- olarak göster
                $('#detailRoomTemp, #detailSetTemp').text('--°C');
                $('#detailHumidity').text('--%');
                $('#detailMode, #detailOptionalMode').text('--');
                $('#detailPower').text('--').removeClass('text-success text-danger');
                $('#currentStatus').text('--');
                temperatureChart.updateSeries([0]);
                humidityChart.updateSeries([0]);
                $('#tempDisplay').text('--');
                $('#optionalModes').html('<p class="text-muted">Opsiyonel mod bilgisi alınamadı</p>');
            });
    }

    // Sıcaklık ayarlama
    window.adjustTemp = async function(change) {
        const tempDisplay = document.getElementById('tempDisplay');
        let currentTemp = parseFloat(tempDisplay.innerText);
        
        if (isNaN(currentTemp)) currentTemp = 24;
        
        const newTemp = currentTemp + change;
        if (newTemp >= 16 && newTemp <= 30) {
            try {
                await sendCommand('setCoolingSetpoint', 'thermostatCoolingSetpoint', newTemp);
                console.log('Sıcaklık ayarlandı:', newTemp);
                await refreshData();
            } catch (error) {
                console.error('Sıcaklık ayarlama hatası:', error);
            }
        }
    }

    // Manuel sıcaklık ayarlama
    window.setManualTemp = async function() {
        const input = document.getElementById('manualTempInput');
        const newTemp = parseInt(input.value);
        
        if (!isNaN(newTemp) && newTemp >= 16 && newTemp <= 30) {
            try {
                await sendCommand('setCoolingSetpoint', 'thermostatCoolingSetpoint', newTemp);
                console.log('Sıcaklık manuel ayarlandı:', newTemp);
                input.value = ''; // Input alanını temizle
                await refreshData();
            } catch (error) {
                console.error('Sıcaklık ayarlama hatası:', error);
            }
        } else {
            alert('Lütfen 16-30°C arasında bir değer girin.');
        }
    }

    // Enter tuşu ile gönderme
    document.getElementById('manualTempInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            setManualTemp();
        }
    });

    // Mod değiştirme
    $('.mode-btn').click(async function() {
        const mode = $(this).data('mode');
        await sendCommand('setAirConditionerMode', 'airConditionerMode', mode);
        $('.mode-btn').removeClass('active');
        $(this).addClass('active');
        refreshData();
    });

    // Güç kontrolü
    $('#powerBtn').click(async function() {
        const currentState = $(this).hasClass('btn-danger');
        const newState = !currentState;
        
        try {
            await sendCommand(newState ? 'on' : 'off', 'switch');
            
            $(this)
                .removeClass('btn-success btn-danger')
                .addClass(newState ? 'btn-danger' : 'btn-success')
                .html(`<i class="fas fa-power-off me-2"></i>${newState ? 'Klimayı Kapat' : 'Klimayı Aç'}`);
            
            await refreshData();
        } catch (error) {
            console.error('Güç durumu değiştirme hatası:', error);
        }
    });

    // Opsiyonel mod değiştirme
    window.toggleOptionalMode = async function(mode) {
        try {
            showLoading();
            const response = await sendCommand('setAcOptionalMode', 'custom.airConditionerOptionalMode', mode);
            console.log('Opsiyonel mod değiştirildi:', mode);
            if (response) {
                await refreshData();
            }
        } catch (error) {
            console.error('Opsiyonel mod değiştirme hatası:', error);
        } finally {
            hideLoading();
        }
    }

    // İlk yükleme ve otomatik yenileme
    $(document).ready(function() {
        refreshData();
        setInterval(refreshData, 30000); // Her 30 saniyede bir güncelle
    });
}); 