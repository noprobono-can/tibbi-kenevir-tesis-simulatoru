Tıbbi kenevir simülatörü

Statik web uygulaması. GitHub Pages ile canlı yayın.

## Davetli giriş (kolay yol)

Kodda e-posta listesi yok. Kim girebilir sorusunun tek yeri: **Supabase Authentication**.

### Bir kez kurulum

1. Supabase → **Authentication → Providers → Email** açık.
2. Aynı ekranda **Allow new users to sign up** kapalı (kimse kendi kaydolamaz).
3. **Project Settings → API** → Project URL + anon key → `gate-config.js` içine yazın.
4. **Authentication → URL Configuration**
   - Site URL: `https://noprobono-can.github.io/tibbi-kenevir-tesis-simulatoru/`
   - Redirect URLs: aynı adres (+ yerel test: `http://127.0.0.1:8877/`)

### Yeni kişi eklemek (tek adım)

1. Supabase → **Authentication → Users → Invite user**
2. E-postayı yazın → davet gider
3. Kişi maildeki bağlantıyla şifresini belirler
4. Siteye e-posta + şifre ile giriş yapar

Erişimi kesmek için aynı Users listesinde kullanıcıyı silin veya banlayın. Kod veya GitHub yayını gerekmez.
