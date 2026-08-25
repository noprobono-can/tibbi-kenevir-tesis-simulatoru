Tıbbi kenevir simülatörü

Statik web uygulaması. GitHub Pages ile canlı yayın.

## Davetli giriş (kolay yol)

Açık kayıt yok. Yeni kişi eklemek için yalnızca Supabase’den davet gönderin.

### Bir kez kurulum (kritik)

1. Supabase → **Authentication → Providers → Email** açık.
2. **Allow new users to sign up** kapalı.
3. **Authentication → URL Configuration** (mutlaka tam adres):
   - **Site URL:** `https://noprobono-can.github.io/tibbi-kenevir-tesis-simulatoru/`
   - **Redirect URLs:**  
     - `https://noprobono-can.github.io/tibbi-kenevir-tesis-simulatoru/`  
     - `https://noprobono-can.github.io/tibbi-kenevir-tesis-simulatoru/index.html`  
     - `http://127.0.0.1:8877/` (yerel test)
4. `gate-config.js` içinde Project URL + anon key dolu olsun.

Site URL yanlışsa (ör. yalnızca `https://noprobono-can.github.io`) davet linki boş sayfaya veya 404’e düşer.

### Yeni kişi

1. Supabase → **Authentication → Users → Invite user**
2. Kişi maildeki bağlantıya tıklar → sitede **şifre belirleme** ekranı açılır
3. Şifreyi kaydeder → simülatöre girer
4. Sonraki girişlerde e-posta + şifre yeterli

Erişimi kesmek: Users listesinde kullanıcıyı silin veya banlayın.
