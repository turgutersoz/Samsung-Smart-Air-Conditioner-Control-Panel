# Klima Kontrol Uygulaması

Bu uygulama, SmartThings API'sini kullanarak akıllı klimanızı kontrol etmenizi sağlayan bir masaüstü uygulamasıdır.

## Özellikler

- Klima açma/kapama
- Sıcaklık ayarlama
- Çalışma modu seçimi (Otomatik, Soğutma, Isıtma, Nem Alma, Fan)
- Opsiyonel mod kontrolü
- Sıcaklık ve nem takibi
- Sistem tepsisi desteği
- Otomatik veri güncelleme (15 saniyede bir)
- Detaylı durum görüntüleme
- MD5 şifreleme ile güvenli veri saklama

## Kurulum

1. Uygulamayı indirin
2. Kurulum dosyasını çalıştırın (`Klima Kontrol Setup.exe`)
3. Kurulum sihirbazını takip edin
4. Uygulamayı başlatın

## İlk Kullanım

1. SmartThings API anahtarınızı hazırlayın
   - [SmartThings Developer Portal](https://developer.smartthings.com/)'a gidin
   - Yeni bir proje oluşturun
   - Personal Access Token oluşturun
   - API anahtarınızı kopyalayın

2. Uygulamayı ilk kez çalıştırdığınızda:
   - API anahtarınızı girin
   - Cihaz listesinden klimanızı seçin veya Cihaz ID'sini manuel olarak girin
   - "Doğrula ve Kaydet" butonuna tıklayın
   - Bilgiler doğrulandıktan sonra "Uygulamayı Çalıştır" butonuna tıklayın

## Kullanım

### Ana Kontroller
- **Güç**: Klimayı açıp kapatmak için güç butonunu kullanın
- **Sıcaklık**: + ve - butonlarıyla veya manuel giriş yaparak sıcaklığı ayarlayın
- **Mod Seçimi**: İstediğiniz çalışma modunu seçin
- **Opsiyonel Modlar**: Cihazınıza özel ek modları kullanın

### Sistem Tepsisi
- Uygulama kapatıldığında sistem tepsisine küçülür
- Sağ tıklayarak hızlı kontrollere erişebilirsiniz
- Çift tıklayarak ana pencereyi açabilirsiniz

### Otomatik Güncelleme
- Uygulama her 15 saniyede bir verileri otomatik günceller
- Her komut sonrası veriler otomatik yenilenir
- Tüm değişiklikler anlık olarak görüntülenir
- Sağ üst köşede son güncelleme zamanı gösterilir

## Sistem Gereksinimleri

- Windows 10 veya üzeri
- Internet bağlantısı
- SmartThings uyumlu klima
- SmartThings API anahtarı

## Güvenlik

- API anahtarınız MD5 şifreleme ile yerel olarak saklanır
- Her kurulumda benzersiz şifreleme anahtarı oluşturulur
- Şifreleme anahtarları güvenli bir şekilde yönetilir
- Tüm hassas veriler şifrelenmiş olarak depolanır
- Veriler sadece uygulama çalışırken şifreleri çözülür
- API anahtarınızı kimseyle paylaşmayın

## Sorun Giderme

1. **API Bağlantı Hatası**
   - API anahtarınızın doğru olduğundan emin olun
   - Internet bağlantınızı kontrol edin
   - SmartThings sunucularının durumunu kontrol edin

2. **Cihaz Bulunamadı**
   - Klimanızın SmartThings'e bağlı olduğundan emin olun
   - API anahtarınızın cihaza erişim yetkisi olduğunu kontrol edin

3. **Uygulama Yanıt Vermiyor**
   - Uygulamayı kapatıp yeniden açın
   - Sistem tepsisindeki simgeye sağ tıklayıp "Çıkış" seçeneğini kullanın
   - Windows Görev Yöneticisi'nden uygulamayı sonlandırın

## Geliştirici Notları

### Teknoloji Stack
- **Frontend**: HTML, CSS, JavaScript, jQuery
- **Backend**: Node.js, Electron, Express
- **Veri Saklama**: Dosya tabanlı (.env, config.json)
- **Şifreleme**: MD5 + Rastgele Anahtar

### Proje Yapısı
```
├── main.js              # Ana Electron süreci
├── preload.js          # Electron preload script
├── public/             # Frontend dosyaları
│   ├── index.html      # Ana uygulama arayüzü
│   ├── config.html     # Yapılandırma arayüzü
│   └── styles.css      # Stil dosyaları
├── assets/            # İkonlar ve medya dosyaları
└── package.json       # Bağımlılıklar ve script'ler
```

### Güvenlik Yapısı
1. **Şifreleme Sistemi**
   - Her kurulumda benzersiz 32-byte anahtar üretilir
   - Veriler MD5 ile şifrelenir
   - Hash doğrulaması ile veri bütünlüğü kontrol edilir

2. **Veri Saklama**
   - API bilgileri .env dosyasında saklanır
   - Şifreleme anahtarı ayrı bir dosyada tutulur
   - Yapılandırma verileri şifrelenmiş JSON olarak saklanır

3. **IPC İletişimi**
   - contextBridge ile güvenli IPC kanalları
   - Asenkron iletişim için Promise tabanlı yapı
   - Hata yönetimi ve loglama sistemi

### Geliştirme Kılavuzu
1. **Kurulum**
   ```bash
   npm install
   ```

2. **Geliştirme Modu**
   ```bash
   npm run start
   ```

3. **Dağıtım**
   ```bash
   npm run build
   ```

4. **Hata Ayıklama**
   - Chrome DevTools ile frontend debugging
   - Console.log ile backend loglama
   - Electron Debug ile süreç takibi

### API Entegrasyonu
1. SmartThings API v1.0 kullanılmaktadır
2. Tüm API çağrıları Promise tabanlıdır
3. Rate limiting ve hata yönetimi mevcuttur
4. Otomatik token yenileme sistemi bulunur

### Performans İyileştirmeleri
1. Debounce ile API çağrıları optimize edilmiştir
2. Önbellek sistemi ile gereksiz istekler engellenir
3. Asenkron işlemler için kuyruk sistemi kullanılır
4. Otomatik bellek yönetimi mevcuttur

## Lisans

ISC Lisansı altında dağıtılmaktadır.

## İletişim

Sorun ve önerileriniz için GitHub üzerinden issue açabilirsiniz. 