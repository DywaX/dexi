# Dexi Room

Mobilya magazalari icin QR onayli, basit oda olcusu ve urun yerlestirme
prototipi.

## Ozellikler

- Musterinin QR ile girdigi oturumu simule eden onay akisi
- Yetkili cihaz tarafindan tek tusla musteri onayi
- Oda genisligi, derinligi ve yuksekligi girisi
- Magaza katalogundan ornek mobilya ekleme
- Urunleri oda planinda surukleyerek yerlestirme
- Sigmayan veya birbirine cakisarak sikisan alanlari kirmizi gosterme
- Sorunsuz yerlesimde yesil durum bildirimi
- Kullanici adi ve sifre ile girilen yonetim paneli
- Birden fazla magaza icin ayri katalog olusturma ve duzenleme
- JSON veya CSV katalog dosyasi yukleme
- Yetkili cihaz ekleme, tek cihaz veya tum cihaz baglantilarini koparma

## Panel Girisi

Demo yonetim paneli icin:

- Kullanici adi: `admin`
- Sifre: `dexi123`

Panel adresi: `admin.html`

## Demo Akisi

Musteri demosu icin `index.html` sayfasinda:

1. `Ornek yerlesimi yukle` butonuna basin.
2. Demo magaza katalogu ve ornek oda yerlesimi otomatik yuklenir.
3. Urunleri oda planinda surukleyerek yesil/kirmizi uygunluk durumunu gorebilirsiniz.
4. Alt kisimdaki teklif onizlemesinde secilen urunler ve tahmini toplam gorunur.
5. `WhatsApp ile teklif iste` butonu demo teklif mesajini hazirlar.

## Dosyalar

- `index.html` - QR akisi, onay paneli, oda formu ve planlayici arayuzu
- `styles.css` - Responsive uygulama tasarimi
- `script.js` - Onay, katalog ekleme, surukleme ve cakisiklik kontrolleri
- `admin.html` - Magaza, katalog ve cihaz yonetimi paneli
- `admin.css` - Panel arayuzu tasarimi
- `admin.js` - Panel girisi, katalog yukleme ve cihaz baglanti yonetimi
- `data-store.js` - Musteri ekrani ve panel arasinda paylasilan yerel veri katmani

## Calistirma

Projeyi yerelde acmak icin `index.html` dosyasini tarayicida acabilirsiniz.
Basit bir yerel sunucu ile denemek isterseniz:

```bash
python3 -m http.server 8000
```

Ardindan `http://localhost:8000` adresini ziyaret edin.
