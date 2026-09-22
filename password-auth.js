(function (global) {
  var PASSWORD_STORE_KEY = "tkts-passwords-v1";
  var MIN_PASSWORD_LENGTH = 8;
  var PBKDF2_ITERATIONS = 100000;

  function readPasswordStore() {
    try {
      var raw = localStorage.getItem(PASSWORD_STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writePasswordStore(store) {
    localStorage.setItem(PASSWORD_STORE_KEY, JSON.stringify(store));
  }

  function bytesToBase64(bytes) {
    var binary = "";
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToBytes(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function derivePasswordHash(password, salt, iterations) {
    var encoder = new TextEncoder();
    return crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"])
      .then(function (keyMaterial) {
        return crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
          keyMaterial,
          256
        );
      });
  }

  function hashPassword(password) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    return derivePasswordHash(password, salt, PBKDF2_ITERATIONS).then(function (hashBuffer) {
      return {
        salt: bytesToBase64(salt),
        hash: bytesToBase64(new Uint8Array(hashBuffer)),
        iterations: PBKDF2_ITERATIONS
      };
    });
  }

  function verifyPassword(password, record) {
    if (!record || !record.salt || !record.hash) return Promise.resolve(false);
    var salt = base64ToBytes(record.salt);
    var iterations = record.iterations || PBKDF2_ITERATIONS;
    return derivePasswordHash(password, salt, iterations).then(function (hashBuffer) {
      return bytesToBase64(new Uint8Array(hashBuffer)) === record.hash;
    });
  }

  function hasStoredPassword(userId) {
    var store = readPasswordStore();
    var rec = store[userId];
    return !!(rec && rec.hash && rec.salt);
  }

  function validatePasswordStrength(password) {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return "Şifre en az " + MIN_PASSWORD_LENGTH + " karakter olmalıdır.";
    }
    return null;
  }

  function createStoredPassword(userId, password) {
    return hashPassword(password).then(function (record) {
      var store = readPasswordStore();
      store[userId] = record;
      writePasswordStore(store);
    });
  }

  function verifyStoredPassword(userId, password) {
    var store = readPasswordStore();
    var record = store[userId];
    if (!record) return Promise.resolve(false);
    return verifyPassword(password, record);
  }

  function changeStoredPassword(userId, currentPassword, newPassword) {
    return verifyStoredPassword(userId, currentPassword).then(function (valid) {
      if (!valid) return "invalid-current";
      return createStoredPassword(userId, newPassword).then(function () {
        return "success";
      });
    });
  }

  function clearStoredPassword(userId) {
    var store = readPasswordStore();
    if (store[userId]) {
      delete store[userId];
      writePasswordStore(store);
    }
  }

  global.TKTS_passwordAuth = {
    PASSWORD_STORE_KEY: PASSWORD_STORE_KEY,
    MIN_PASSWORD_LENGTH: MIN_PASSWORD_LENGTH,
    hasStoredPassword: hasStoredPassword,
    validatePasswordStrength: validatePasswordStrength,
    createStoredPassword: createStoredPassword,
    verifyStoredPassword: verifyStoredPassword,
    changeStoredPassword: changeStoredPassword,
    clearStoredPassword: clearStoredPassword
  };
})(window);
