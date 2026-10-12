# Wlâme · GitHub Vitrini

Tüm **public GitHub projelerini** otomatik gösteren, siyah-gri geçişli modern
tek sayfalık web sitesi. Repolar **canlı GitHub API** üzerinden çekilir; yeni bir
public repo açtığında sayfada kendiliğinden görünür — kod değiştirmen gerekmez.

## Özellikler

- 🌑 Siyah → gri gradyan arka plan, ışıma (glow) ve ince grid dokusu
- 👤 GitHub profil fotoğrafı, isim, bio ve istatistikler (repo / yıldız / takipçi)
- 📖 Profil reposu `wlame-dx`'in README'sini **"Hakkında"** bölümünde gösterir (uzunsa katlanır)
- 🌐 **TR/EN dil desteği** — tarayıcı dili TR ise Türkçe, değilse İngilizce; nav'dan elle değiştirilebilir ve seçim hatırlanır
- 🔎 Anlık arama + sıralama (son güncellenen, yıldız, isim, en yeni)
- 🏷️ Dile göre filtre çipleri (renk kodlu)
- 🃏 Fareyi takip eden ışıklı repo kartları; dil, yıldız, fork ve güncelleme zamanı
- 🌐 Reposunda **canlı Pages sitesi** olan kartlara otomatik "Site" düğmesi (sahte/404 sayfalar tespit edilip eklenmez)
- 📱 Mobil uyumlu, karanlık tema
- ⚡ Sıfır bağımlılık (framework yok, sadece HTML + CSS + JS)

## Dosya yapısı

```
index.html    → Sayfa iskeleti
styles.css    → Tema ve tasarım
app.js        → GitHub API'den veri çekme + listeleme
.nojekyll     → GitHub Pages'in Jekyll'i atlaması için
```

## Ayarlar

Kullanıcı adını değiştirmek için `app.js` içindeki tek satırı düzenle:

```js
const USERNAME = "wlame-dx";
```

## GitHub Pages'te yayınlama

1. GitHub'da yeni bir repo oluştur (ör. `wlame-dx.github.io` veya istediğin isim).
2. Bu klasördeki dosyaları o repoya push et:

   ```bash
   git init
   git add .
   git commit -m "GitHub vitrini"
   git branch -M main
   git remote add origin https://github.com/wlame-dx/REPO_ADI.git
   git push -u origin main
   ```

3. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: **main**, klasör: **/ (root)** → Save.
4. Birkaç dakika içinde siten şurada yayında olur:
   - `https://wlame-dx.github.io/` (repo adı `wlame-dx.github.io` ise)
   - `https://wlame-dx.github.io/REPO_ADI/` (diğer repo adlarında)

## Not: API istek limiti

Kimlik doğrulamasız GitHub API saatte **60 istek / IP** verir. Tek sayfa yüklemesi
2 istek kullandığı için bu vitrin için fazlasıyla yeterli. Limit aşılırsa sayfa
anlaşılır bir uyarı gösterir ve doğrudan GitHub profiline bağlantı verir.

## Canlı önizleme (yerel)

```bash
# Python
python -m http.server 8765
# veya Node
npx serve .
```

Sonra tarayıcıda `http://localhost:8765` adresini aç.
