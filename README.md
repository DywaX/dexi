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
- Her magaza icin ayri QR linki
- Birden fazla magazasi olan isletmeler icin magaza gruplama

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

Magazaya ozel QR demosu icin:

- `index.html?store=store-bellora`
- `index.html?store=store-modern`

Bu linklerden giren musteri magaza secimi yapmaz; sadece linkteki
magazanin katalogunu gorur.

## Dosyalar

- `index.html` - QR akisi, onay paneli, oda formu ve planlayici arayuzu
- `styles.css` - Responsive uygulama tasarimi
- `script.js` - Onay, katalog ekleme, surukleme ve cakisiklik kontrolleri
- `admin.html` - Magaza, katalog ve cihaz yonetimi paneli
- `admin.css` - Panel arayuzu tasarimi
- `admin.js` - Panel girisi, katalog yukleme ve cihaz baglanti yonetimi
- `site-config.js` - Canli domain ve iletisim e-postasi (QR linkleri ve footer)
- `404.html` ve `robots.txt` - Temel web sunucu dosyalari
- `netlify.toml` - Sirukle-birak (Netlify Drop) ile canli teknik yayin uyumu
- `.github/workflows/deploy-pages.yml` - GitHub Pages otomatik yayin (main branch)
- `supabase-config.js` - Supabase API (yalniz kamusal anahtar)
- `supabase-schema.sql` - Veritabani semasi

## Calistirma

Projeyi yerelde acmak icin `index.html` dosyasini tarayicida acabilirsiniz.
Basit bir yerel sunucu ile denemek isterseniz:

```bash
python3 -m http.server 8000
```

Ardindan `http://localhost:8000` adresini ziyaret edin.

**Not:** Bazi CDN linkleri (`jsdelivr.net` ile dogrudan `index.html`) dosyayi
`text/plain` olarak sunabilir ve tarayici kod gibi goruntuler. Gercek sayfa için
 klasoru veya ZIP cikmis halini **`https://app.netlify.com/drop`** adresine
 suruklemen yeterli; `netlify.toml` dahil uygun MIME ile servis verilir.
GitHub'in `raw.` adresini degil, yerel dosya ya da Pages / Netlify kullan.

## Canli site: domain, Gmail, GitHub Pages

1. **Domain** satin alin (Google Domains, Cloudflare, Natro vb.). DNS yonlendirmesini
   barindirma saglayicinizin talimatina gore yapin.
2. GitHub repo **Settings > Pages** menusunden **Source: GitHub Actions** secin.
3. `main` branchine push edildiginde `.github/workflows/deploy-pages.yml` ile site
   yayinlanir (cikti URL’i Actions logunda ve Pages ayarlarinda gorunur).
4. `site-config.js` dosyasinda:
   - `publicBaseUrl`: Kalici adres, sonda `/` olmadan (ornek: `https://www.senin-domain.com`
     veya GitHub icin `https://kullanici.github.io/repo`).
   - `contactEmail`: Gorunecek Gmail veya kurumsal iletisim adresi.
     Bu alan dolduruldugunda footer’da `mailto` linki belirir; admin panelinin
     altinda da ayni iletisim satiri gosterilir.
5. Ozel domain GitHub Pages ile **Settings > Pages > Custom domain** uzerinden veya
   barindirmada CNAME/A kayitlari ile baglanir. Domaini aldiktan sonra sadece bu
   dosyayi guncellemeniz yeterlidir; kodu hatirlamadan `publicBaseUrl` yazmaniz
   QR linklerinin dogru kopyalanmasi icin onemlidir.

**Not:** Gmail hesabi acmak veya domain satin almak kodla yapilamaz; tarayicidan
sizin kimliginizle tamamlanmalidir. Teknik tarafda gereken her sey bu repoda ve
`site-config.js` uzerinden yonetilir.

## Supabase Kurulumu

Canli pilot icin Supabase baglantisi `supabase-config.js` dosyasindadir.
Veritabanini hazirlamak icin:

1. Supabase panelinde projeyi acin.
2. `SQL Editor` bolumune girin.
3. `supabase-schema.sql` dosyasinin tamamini calistirin.
4. Siteyi yenileyin.

Tablolar hazir olunca paneldeki magaza, urun, cihaz ve teklif talebi verileri
Supabase'e yazilir. Tablolar hazir degilse uygulama bozulmadan yerel demo
verisiyle calismaya devam eder.

Not: `supabase-schema.sql` icindeki RLS politikalari ilk tanidik pilot icin
bilerek aciktir. Herkese acik satis asamasindan once kullanici girisi ve daha
siki yetki politikalari eklenmelidir.
