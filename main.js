const { app, BrowserWindow, Tray, Menu, dialog, ipcMain } = require('electron');
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

let mainWindow;
let tray = null;
let deviceStatus = {
    power: 'off',
    mode: 'auto'
};

// Global API değişkenleri
let apiKey = '';
let deviceId = '';

// Express sunucusu
const server = express();
const port = 3000;

// .env dosyasının konumunu belirle
const envPath = app.isPackaged 
    ? path.join(app.getPath('userData'), '.env')
    : path.join(__dirname, '.env');

console.log('ENV dosya konumu:', envPath);

// API bilgilerini yükle
function loadAPIConfig() {
    try {
        require('dotenv').config({ path: envPath });
        apiKey = process.env.SMARTTHINGS_API_KEY;
        deviceId = process.env.SMARTTHINGS_DEVICE_ID;
        console.log('API bilgileri yüklendi:', { apiKey: apiKey?.substring(0, 5) + '...', deviceId: deviceId?.substring(0, 5) + '...' });
        return true;
    } catch (error) {
        console.error('API bilgileri yüklenirken hata:', error);
        return false;
    }
}

// API bilgilerini kullanıcıdan alma fonksiyonu
function showAPIConfigDialog() {
    return new Promise((resolve) => {
        const configWindow = new BrowserWindow({
            width: 500,
            height: 400,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            resizable: false,
            minimizable: false,
            maximizable: false,
            modal: mainWindow ? true : false,
            show: false,
            parent: mainWindow || null
        });

        // HTML dosyasını yükle
        configWindow.loadFile(path.join(__dirname, 'public', 'config.html'));

        configWindow.once('ready-to-show', () => {
            configWindow.show();
        });

        // Pencere kapatıldığında
        configWindow.on('closed', () => {
            if (!fs.existsSync(envPath)) {
                resolve(false);
            } else {
                loadAPIConfig(); // API bilgilerini yeniden yükle
                resolve(true);
            }
        });
    });
}

// IPC olaylarını dinle
ipcMain.handle('saveConfig', async (event, { apiKey: newApiKey, deviceId: newDeviceId }) => {
    try {
        console.log('saveConfig olayı alındı:', { apiKey: newApiKey?.substring(0, 5) + '...', deviceId: newDeviceId?.substring(0, 5) + '...' });
        
        // API bilgilerini test et
        const testResponse = await axios.get(`https://api.smartthings.com/v1/devices/${newDeviceId}/status`, {
            headers: { 'Authorization': `Bearer ${newApiKey}` }
        });

        if (testResponse.status === 200) {
            console.log('API testi başarılı, dosya kaydediliyor...');

            // Klasörün varlığını kontrol et ve oluştur
            const envDir = path.dirname(envPath);
            if (!fs.existsSync(envDir)) {
                fs.mkdirSync(envDir, { recursive: true });
            }

            // API bilgileri doğruysa .env dosyasını oluştur
            const envContent = `SMARTTHINGS_API_KEY=${newApiKey}\nSMARTTHINGS_DEVICE_ID=${newDeviceId}`;
            fs.writeFileSync(envPath, envContent, 'utf8');
            console.log('.env dosyası başarıyla kaydedildi');

            // Global değişkenleri güncelle
            apiKey = newApiKey;
            deviceId = newDeviceId;

            return true;
        }

        throw new Error('API testi başarısız');
    } catch (error) {
        console.error('saveConfig hatası:', error);
        throw new Error('API bilgileri test edilirken hata oluştu: ' + (error.response?.data?.message || error.message));
    }
});

ipcMain.handle('startApp', async () => {
    try {
        console.log('startApp olayı alındı');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            return true;
        }
        createMainWindow();
        return true;
    } catch (error) {
        console.error('startApp hatası:', error);
        throw error;
    }
});

// .env dosyasını kontrol et ve yükle
async function checkAndLoadEnv() {
    try {
        console.log('ENV dosyası kontrol ediliyor...');
        console.log('ENV dosya konumu:', envPath);
        
        // .env dosyası yoksa veya API bilgileri eksikse
        if (!fs.existsSync(envPath) || !loadAPIConfig() || !apiKey || !deviceId) {
            console.log('.env dosyası veya API bilgileri eksik, yapılandırma penceresi açılıyor...');
            
            // Varsa eski .env dosyasını sil
            if (fs.existsSync(envPath)) {
                try {
                    fs.unlinkSync(envPath);
                    console.log('Eski .env dosyası silindi');
                } catch (unlinkError) {
                    console.error('Eski .env dosyası silinirken hata:', unlinkError);
                }
            }

            // API yapılandırma penceresini göster
            console.log('API yapılandırma penceresi açılıyor...');
            const result = await showAPIConfigDialog();
            
            if (!result) {
                console.log('API yapılandırması iptal edildi');
                return false;
            }

            console.log('API yapılandırması tamamlandı, bilgiler yükleniyor...');
            
            // API bilgilerini tekrar yükle
            if (!loadAPIConfig() || !apiKey || !deviceId) {
                console.log('API bilgileri yüklenemedi');
                return false;
            }
        }

        // API bağlantısını test et
        try {
            console.log('API bağlantısı test ediliyor...');
            const testResponse = await axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            
            if (testResponse.status !== 200) {
                throw new Error('API bağlantı testi başarısız');
            }
            
            console.log('API bağlantısı başarılı');
            return true;
        } catch (error) {
            console.error('API test hatası:', error.message);
            
            // API testi başarısız olursa tekrar yapılandırma penceresini göster
            console.log('API testi başarısız, tekrar deneniyor...');
            if (fs.existsSync(envPath)) {
                fs.unlinkSync(envPath);
            }
            return await checkAndLoadEnv();
        }
    } catch (error) {
        console.error('.env dosyası yüklenirken hata oluştu:', error);
        return false;
    }
}

// API fonksiyonları
async function sendCommand(command, capability, argument = null) {
    try {
        await axios.post(
            `https://api.smartthings.com/v1/devices/${deviceId}/commands`,
            {
                commands: [{
                    component: 'main',
                    capability: capability,
                    command: command,
                    arguments: argument !== null ? [argument] : []
                }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Komut Hatası:', error);
    }
}

// Cihaz durumunu al ve tray menüsünü güncelle
async function getDeviceStatus() {
    try {
        const response = await axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const status = response.data;
        const components = status.components?.main || {};

        deviceStatus = {
            power: components.switch?.switch?.value || 'off',
            mode: components.airConditionerMode?.airConditionerMode?.value || 'auto',
            temperature: components.temperatureMeasurement?.temperature?.value,
            humidity: components.relativeHumidityMeasurement?.humidity?.value,
            setTemperature: components.thermostatCoolingSetpoint?.coolingSetpoint?.value
        };

        updateTrayMenu();
        return deviceStatus;
    } catch (error) {
        console.error('Cihaz durumu alınamadı:', error);
        return deviceStatus;
    }
}

function updateTrayMenu() {
    const contextMenu = Menu.buildFromTemplate([
        {
            label: deviceStatus.power === 'on' ? 'Klimayı Kapat' : 'Klimayı Aç',
            click: async () => {
                await sendCommand(deviceStatus.power === 'on' ? 'off' : 'on', 'switch');
                await getDeviceStatus();
            }
        },
        { type: 'separator' },
        {
            label: 'Klima Modu',
            submenu: [
                {
                    label: 'Otomatik',
                    type: 'radio',
                    checked: deviceStatus.mode === 'auto',
                    click: async () => {
                        await sendCommand('setAirConditionerMode', 'airConditionerMode', 'auto');
                        await getDeviceStatus();
                    }
                },
                {
                    label: 'Soğutma',
                    type: 'radio',
                    checked: deviceStatus.mode === 'cool',
                    click: async () => {
                        await sendCommand('setAirConditionerMode', 'airConditionerMode', 'cool');
                        await getDeviceStatus();
                    }
                },
                {
                    label: 'Isıtma',
                    type: 'radio',
                    checked: deviceStatus.mode === 'heat',
                    click: async () => {
                        await sendCommand('setAirConditionerMode', 'airConditionerMode', 'heat');
                        await getDeviceStatus();
                    }
                },
                {
                    label: 'Nem Alma',
                    type: 'radio',
                    checked: deviceStatus.mode === 'dry',
                    click: async () => {
                        await sendCommand('setAirConditionerMode', 'airConditionerMode', 'dry');
                        await getDeviceStatus();
                    }
                },
                {
                    label: 'Fan',
                    type: 'radio',
                    checked: deviceStatus.mode === 'fan',
                    click: async () => {
                        await sendCommand('setAirConditionerMode', 'airConditionerMode', 'fan');
                        await getDeviceStatus();
                    }
                }
            ]
        },
        { type: 'separator' },
        {
            label: 'Paneli Göster',
            click: () => {
                mainWindow.show();
            }
        },
        { type: 'separator' },
        {
            label: 'Çıkış',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
}

// Express sunucusu ve API endpoint'leri
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.json());

server.get('/api/status', async (req, res) => {
    try {
        if (!apiKey || !deviceId) {
            console.error('API bilgileri eksik');
            return res.status(500).json({ 
                error: 'API yapılandırması eksik',
                temperature: null,
                setTemperature: null,
                humidity: null,
                power: 'off',
                mode: 'auto',
                optionalModes: [],
                currentOptionalMode: null
            });
        }

        const response = await axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        console.log('Ham API yanıtı:', JSON.stringify(response.data, null, 2));
        
        const status = response.data;
        const components = status.components?.main || {};
        
        // Değerleri güvenli bir şekilde al ve doğrula
        const temperature = components.temperatureMeasurement?.temperature?.value;
        const setTemperature = components.thermostatCoolingSetpoint?.coolingSetpoint?.value;
        const humidity = components.relativeHumidityMeasurement?.humidity?.value;
        const power = components.switch?.switch?.value;
        const mode = components.airConditionerMode?.airConditionerMode?.value;
        const optionalModes = components['custom.airConditionerOptionalMode']?.supportedAcOptionalMode?.value || [];
        const currentOptionalMode = components['custom.airConditionerOptionalMode']?.acOptionalMode?.value;

        // Değerleri doğrula ve formatla
        const data = {
            temperature: typeof temperature === 'number' ? temperature : null,
            setTemperature: typeof setTemperature === 'number' ? setTemperature : null,
            humidity: typeof humidity === 'number' ? humidity : null,
            power: power || 'off',
            mode: mode || 'auto',
            optionalModes: Array.isArray(optionalModes) ? optionalModes : [],
            currentOptionalMode: currentOptionalMode || null
        };

        // Global deviceStatus'u güncelle
        deviceStatus = {
            power: data.power,
            mode: data.mode,
            temperature: data.temperature,
            setTemperature: data.setTemperature,
            humidity: data.humidity,
            optionalModes: data.optionalModes,
            currentOptionalMode: data.currentOptionalMode
        };

        // Tray menüsünü güncelle
        if (tray) {
            updateTrayMenu();
        }

        console.log('İşlenmiş API yanıtı:', data);
        res.json(data);
    } catch (error) {
        console.error('API Hatası:', error);
        console.error('Hata detayları:', error.response?.data);
        console.error('Hata stack:', error.stack);
        
        // Hata durumunda varsayılan değerler döndür
        res.status(500).json({
            error: 'API hatası',
            details: error.message,
            temperature: null,
            setTemperature: null,
            humidity: null,
            power: 'off',
            mode: 'auto',
            optionalModes: [],
            currentOptionalMode: null
        });
    }
});

server.post('/api/command', async (req, res) => {
    try {
        if (!apiKey || !deviceId) {
            throw new Error('API bilgileri eksik');
        }

        const { command, capability, argument } = req.body;
        const response = await axios.post(
            `https://api.smartthings.com/v1/devices/${deviceId}/commands`,
            {
                commands: [{
                    component: 'main',
                    capability: capability,
                    command: command,
                    arguments: argument !== null ? [argument] : []
                }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        await getDeviceStatus(); // Tray menüsünü güncelle
        res.json(response.data);
    } catch (error) {
        console.error('Komut Hatası:', error.response?.data || error.message);
        res.status(500).json({ error: 'Komut hatası', details: error.message });
    }
});

// Ana pencereyi oluştur
function createMainWindow() {
    // Eğer ana pencere zaten varsa ve geçerliyse, yeni pencere oluşturma
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        return mainWindow;
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        show: false // Pencereyi başlangıçta gizle
    });

    // Ana pencereyi göster
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.show();
    
    // Pencere kapatıldığında uygulamayı sonlandırma
    mainWindow.on('close', function (event) {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    // Tray icon oluştur
    const iconPath = app.isPackaged
        ? path.join(process.resourcesPath, 'assets', 'air.ico')
        : path.join(__dirname, 'assets', 'air.ico');
    
    console.log('Icon dosya konumu:', iconPath);
    console.log('Icon dosyası mevcut mu:', fs.existsSync(iconPath));

    try {
        if (!tray) {
            tray = new Tray(iconPath);
            tray.setToolTip('Klima Kontrol');
        }
        
        // İlk durumu al
        getDeviceStatus();
        
        // Her 30 saniyede bir durumu güncelle
        setInterval(getDeviceStatus, 30000);

    } catch (error) {
        console.error('Tray icon oluşturma hatası:', error);
        dialog.showErrorBox('Hata', 
            'Sistem tepsisi ikonu oluşturulamadı.\n\n' +
            'Hata detayı: ' + error.message
        );
    }

    return mainWindow;
}

// Express sunucusunu başlat ve ardından pencereyi oluştur
function startApp() {
    // Express sunucusunu başlat
    server.listen(port, async () => {
        console.log(`Server running at http://localhost:${port}`);
        
        try {
            // Önce API yapılandırmasını kontrol et
            const envResult = await checkAndLoadEnv();
            if (!envResult) {
                console.log('API yapılandırması başarısız, yeniden deneniyor...');
                // Yapılandırma başarısız olsa bile uygulamayı kapatma
            }

            // Ana pencereyi oluştur
            createMainWindow();

        } catch (error) {
            console.error('Uygulama başlatma hatası:', error);
            dialog.showErrorBox('Hata', 
                'Uygulama başlatılırken bir hata oluştu.\n\n' +
                'Hata detayı: ' + error.message
            );
            // Hata durumunda bile uygulamayı kapatma
        }
    }).on('error', (err) => {
        console.error('Express sunucusu başlatma hatası:', err);
        dialog.showErrorBox('Hata', 
            'Express sunucusu başlatılamadı.\n\n' +
            'Hata detayı: ' + err.message
        );
        // Port kullanımda olabilir, farklı bir port dene
        port = 3001;
        startApp();
    });
}

// Uygulama hazır olduğunda başlat
app.whenReady().then(startApp);

// Tüm pencereler kapatıldığında
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Uygulama aktifleştirildiğinde
app.on('activate', function () {
    if (mainWindow === null) {
        startApp();
    }
});

// Uygulama kapatılmadan önce
app.on('before-quit', function () {
    app.isQuitting = true;
});

// Rastgele encryption key üret
function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}

// MD5 şifreleme fonksiyonu
function encrypt(text, key) {
    const hash = crypto.createHash('md5');
    hash.update(text + key);
    return hash.digest('hex');
}

// Şifrelenmiş veriyi kontrol et
function verifyEncrypted(text, key, hash) {
    const testHash = encrypt(text, key);
    return testHash === hash;
}

// Yapılandırma dosyası yolu
const configPath = app.isPackaged 
    ? path.join(app.getPath('userData'), 'config.json')
    : path.join(__dirname, 'config.json');

// Şifreleme anahtarı dosya yolu
const keyPath = app.isPackaged 
    ? path.join(app.getPath('userData'), 'encryption.key')
    : path.join(__dirname, 'encryption.key');

// Şifreleme anahtarını yükle veya oluştur
function initializeEncryption() {
    try {
        if (!fs.existsSync(keyPath)) {
            const key = generateEncryptionKey();
            fs.writeFileSync(keyPath, key);
            return key;
        }
        return fs.readFileSync(keyPath, 'utf8');
    } catch (error) {
        console.error('Şifreleme anahtarı oluşturma hatası:', error);
        return generateEncryptionKey();
    }
}

// Yapılandırmayı şifreli olarak kaydet
function saveEncryptedConfig(config) {
    try {
        const key = initializeEncryption();
        const configStr = JSON.stringify(config);
        const encryptedData = {
            data: configStr,
            hash: encrypt(configStr, key)
        };
        fs.writeFileSync(configPath, JSON.stringify(encryptedData));
        return true;
    } catch (error) {
        console.error('Yapılandırma kaydetme hatası:', error);
        return false;
    }
}

// Şifreli yapılandırmayı yükle
function loadEncryptedConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            return null;
        }

        const key = initializeEncryption();
        const encryptedData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (verifyEncrypted(encryptedData.data, key, encryptedData.hash)) {
            return JSON.parse(encryptedData.data);
        } else {
            console.error('Yapılandırma dosyası bozulmuş veya değiştirilmiş');
            return null;
        }
    } catch (error) {
        console.error('Yapılandırma yükleme hatası:', error);
        return null;
    }
}

// IPC olaylarını güncelle
ipcMain.on('saveConfig', (event, config) => {
    const result = saveEncryptedConfig(config);
    event.reply('configSaved', result);
});

ipcMain.on('loadConfig', (event) => {
    const config = loadEncryptedConfig();
    event.reply('configLoaded', config || { apiKey: '', deviceId: '' });
}); 