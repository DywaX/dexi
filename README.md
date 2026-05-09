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

## Dosyalar

- `index.html` - QR akisi, onay paneli, oda formu ve planlayici arayuzu
- `styles.css` - Responsive uygulama tasarimi
- `script.js` - Onay, katalog ekleme, surukleme ve cakisiklik kontrolleri

## Calistirma

Projeyi yerelde acmak icin `index.html` dosyasini tarayicida acabilirsiniz.
Basit bir yerel sunucu ile denemek isterseniz:

```bash
python3 -m http.server 8000
```

Ardindan `http://localhost:8000` adresini ziyaret edin.
