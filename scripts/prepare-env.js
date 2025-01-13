const fs = require('fs');
const path = require('path');

// Build öncesi .env dosyasını hazırla
function prepareEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const buildEnvPath = path.join(__dirname, '..', 'build', '.env');

    // .env dosyası varsa
    if (fs.existsSync(envPath)) {
        // build klasörü yoksa oluştur
        if (!fs.existsSync(path.join(__dirname, '..', 'build'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'build'));
        }

        // .env dosyasını build klasörüne kopyala
        fs.copyFileSync(envPath, buildEnvPath);
        console.log('.env dosyası build klasörüne kopyalandı');
    } else {
        console.log('.env dosyası bulunamadı');
    }
}

prepareEnv(); 