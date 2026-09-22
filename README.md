Tıbbi kenevir simülatörü

Statik web uygulaması. GitHub Pages ile canlı yayın.

## Giriş (kullanıcı adı + şifre)

Strategic Road Map ile aynı model:

1. Admin `admin.html` adresine girer (`gate-config.js` → `adminPassword`).
2. Üyelere kullanıcı adı ekler.
3. Herkesin görmesi için **gate-config.js indir** → repoya koy → commit/push.
4. Kullanıcı sitede kullanıcı adını yazar; ilk girişte kendi şifresini oluşturur (PBKDF2, yalnızca o tarayıcıda).
5. Sonraki girişlerde kullanıcı adı + şifre.

Admin URL’sini paylaşmayın. Bu tarayıcı tarafı bir kilittir; kaynak kodda kullanıcı listesi görünür.
