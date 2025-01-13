const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Kurulum sırasında .env dosyasını oluştur
function setupEnv() {
    // Uygulama veri dizinini al
    const userDataPath = process.env.APPDATA || (
        process.platform === 'darwin' ? 
        path.join(process.env.HOME, 'Library', 'Application Support') : 
        path.join(process.env.HOME, '.local', 'share')
    );
    
    const appDataPath = path.join(userDataPath, 'klima-kontrol');
    const envPath = path.join(appDataPath, '.env');

    // Uygulama veri dizini yoksa oluştur
    if (!fs.existsSync(appDataPath)) {
        fs.mkdirSync(appDataPath, { recursive: true });
    }

    // .env dosyası yoksa oluştur
    if (!fs.existsSync(envPath)) {
        const envContent = `SMARTTHINGS_API_KEY=
SMARTTHINGS_DEVICE_ID=`;
        fs.writeFileSync(envPath, envContent);
        console.log('.env dosyası oluşturuldu:', envPath);
    } else {
        console.log('.env dosyası zaten mevcut:', envPath);
    }
}

setupEnv(); 