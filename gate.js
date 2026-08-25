(function () {
  var cfg = window.TKTS_GATE_CONFIG || {};
  var client = null;
  var msgTimer = null;
  var mode = "login";
  var PENDING_KEY = "tkts-set-pass";

  function el(id) {
    return document.getElementById(id);
  }

  function hasConfig() {
    var url = String(cfg.supabaseUrl || "");
    var key = String(cfg.supabaseAnonKey || "");
    return url.indexOf("YOUR_") < 0 && key.indexOf("YOUR_") < 0 && url.length > 8 && key.length > 20;
  }

  function initClient() {
    if (!hasConfig() || !window.supabase || !window.supabase.createClient) return null;
    if (!client) {
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          flowType: "pkce"
        }
      });
    }
    return client;
  }

  function readAuthParams() {
    var out = {};
    function absorb(raw) {
      if (!raw) return;
      var q = raw.charAt(0) === "?" || raw.charAt(0) === "#" ? raw.slice(1) : raw;
      q.split("&").forEach(function (part) {
        if (!part) return;
        var i = part.indexOf("=");
        var k = decodeURIComponent(i < 0 ? part : part.slice(0, i));
        var v = decodeURIComponent(i < 0 ? "" : part.slice(i + 1).replace(/\+/g, " "));
        out[k] = v;
      });
    }
    absorb(window.location.search);
    absorb(window.location.hash);
    return out;
  }

  function clearAuthParamsFromUrl() {
    try {
      var clean = window.location.pathname + window.location.search.replace(/([?&])(code|type|token_hash|error|error_code|error_description)=[^&]*/g, "").replace(/^&/, "?").replace(/\?$/, "");
      window.history.replaceState({}, document.title, clean || window.location.pathname);
    } catch (e) {}
  }

  function pendingPassword() {
    try { return sessionStorage.getItem(PENDING_KEY) === "1"; } catch (e) { return false; }
  }

  function setPendingPassword(on) {
    try {
      if (on) sessionStorage.setItem(PENDING_KEY, "1");
      else sessionStorage.removeItem(PENDING_KEY);
    } catch (e) {}
  }

  function lock() {
    document.documentElement.classList.add("locked");
    document.documentElement.classList.remove("unlocked");
    var gate = el("gate");
    if (gate) gate.removeAttribute("hidden");
    updateSessionUi(null);
  }

  function unlock(user) {
    document.documentElement.classList.remove("locked");
    document.documentElement.classList.add("unlocked");
    var gate = el("gate");
    if (gate) gate.setAttribute("hidden", "");
    updateSessionUi(user);
  }

  function updateSessionUi(user) {
    var email = user && user.email ? user.email : "";
    var chip = el("gateUserChip");
    var logout = el("gateLogout");
    if (chip) {
      chip.textContent = email;
      chip.hidden = !email;
    }
    if (logout) logout.hidden = !email;
  }

  function hideMsg() {
    var n = el("gateMsg");
    if (n) n.hidden = true;
  }

  function showMsg(text, kind) {
    var n = el("gateMsg");
    if (!n) return;
    n.textContent = text;
    n.className = "gate-msg" + (kind ? (" " + kind) : "");
    n.hidden = false;
    if (msgTimer) clearTimeout(msgTimer);
    if (kind !== "ok") {
      msgTimer = setTimeout(hideMsg, 5200);
    }
  }

  function trError(error) {
    var m = (error && error.message) ? error.message : "Bir hata olu\u015ftu.";
    if (m.indexOf("Invalid login credentials") >= 0) {
      return "E-posta veya \u015fifre hatal\u0131. \u00d6nce davet mailindeki ba\u011flant\u0131yla \u015fifrenizi belirleyin.";
    }
    if (m.indexOf("Email not confirmed") >= 0) {
      return "Davet hen\u00fcz tamamlanmad\u0131. E-postadaki ba\u011flant\u0131y\u0131 a\u00e7\u0131p \u015fifrenizi belirleyin.";
    }
    if (m.indexOf("Signups not allowed") >= 0 || m.indexOf("signup is disabled") >= 0) {
      return "A\u00e7\u0131k kay\u0131t kapal\u0131. Eri\u015fim i\u00e7in y\u00f6neticiden davet isteyin.";
    }
    if (m.indexOf("Password should be at least") >= 0) return "\u015eifre en az 6 karakter olmal\u0131.";
    if (m.indexOf("New password should be different") >= 0) return "Yeni bir \u015fifre se\u00e7in.";
    if (m.indexOf("Unable to validate email address") >= 0) return "Ge\u00e7erli bir e-posta adresi girin.";
    if (m.indexOf("Auth session missing") >= 0) {
      return "Davet oturumu bulunamad\u0131. Maildeki ba\u011flant\u0131y\u0131 yeniden a\u00e7\u0131n (s\u00fcresi dolmu\u015f olabilir).";
    }
    return m;
  }

  function setMode(next) {
    mode = next === "setPassword" ? "setPassword" : "login";
    var emailWrap = el("gateEmailWrap");
    var pass2 = el("gatePass2Wrap");
    var pass2Input = el("gatePass2");
    var emailInput = el("gateEmail");
    var passInput = el("gatePass");
    var passLabel = el("gatePassLabel");
    var lead = el("gateLead");
    var submit = el("gateSubmit");

    if (emailWrap) emailWrap.hidden = mode === "setPassword";
    if (pass2) pass2.hidden = mode !== "setPassword";
    if (emailInput) emailInput.required = mode === "login";
    if (pass2Input) pass2Input.required = mode === "setPassword";
    if (passLabel) passLabel.textContent = mode === "setPassword" ? "Yeni \u015fifre" : "\u015eifre";
    if (passInput) {
      passInput.autocomplete = mode === "setPassword" ? "new-password" : "current-password";
      passInput.value = "";
    }
    if (pass2Input) pass2Input.value = "";
    if (submit) submit.textContent = mode === "setPassword" ? "\u015eifreyi kaydet ve gir" : "Giri\u015f yap";
    if (lead) {
      lead.textContent = mode === "setPassword"
        ? "Davet kabul edildi. Hesab\u0131n\u0131z i\u00e7in bir \u015fifre belirleyin."
        : "Yaln\u0131zca davet edilen hesaplarla oturum a\u00e7\u0131l\u0131r. Davet mailindeki ba\u011flant\u0131yla \u015fifrenizi belirleyin, sonra buradan giri\u015f yap\u0131n.";
    }
  }

  function enterSetPassword(user) {
    setPendingPassword(true);
    setMode("setPassword");
    lock();
    updateSessionUi(user || null);
    var emailInput = el("gateEmail");
    if (emailInput && user && user.email) emailInput.value = user.email;
    var pass = el("gatePass");
    if (pass) pass.focus();
  }

  function enterLogin() {
    setPendingPassword(false);
    setMode("login");
  }

  function bindLogout() {
    var btn = el("gateLogout");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var sb = initClient();
      setPendingPassword(false);
      if (sb) sb.auth.signOut();
      else {
        enterLogin();
        lock();
      }
    });
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    hideMsg();
    var sb = initClient();
    if (!sb) {
      showMsg("gate-config.js dosyas\u0131nda Supabase URL ve anon key tan\u0131mlay\u0131n.", "warn");
      return;
    }
    var passEl = el("gatePass");
    var pass2El = el("gatePass2");
    var pass = passEl ? String(passEl.value || "") : "";
    var submit = el("gateSubmit");
    if (submit) submit.disabled = true;
    try {
      if (mode === "setPassword") {
        var pass2 = pass2El ? String(pass2El.value || "") : "";
        if (pass.length < 6) {
          showMsg("\u015eifre en az 6 karakter olmal\u0131.", "err");
          return;
        }
        if (pass !== pass2) {
          showMsg("\u015eifreler e\u015fle\u015fmiyor.", "err");
          return;
        }
        var upd = await sb.auth.updateUser({ password: pass });
        if (upd.error) {
          showMsg(trError(upd.error), "err");
          return;
        }
        setPendingPassword(false);
        clearAuthParamsFromUrl();
        showMsg("\u015eifre kaydedildi.", "ok");
        unlock(upd.data.user);
        return;
      }

      var emailEl = el("gateEmail");
      var email = emailEl ? String(emailEl.value || "").trim().toLowerCase() : "";
      if (!email || !pass) {
        showMsg("E-posta ve \u015fifre gerekli.", "err");
        return;
      }
      var signIn = await sb.auth.signInWithPassword({ email: email, password: pass });
      if (signIn.error) {
        showMsg(trError(signIn.error), "err");
        if (passEl) passEl.value = "";
        return;
      }
      unlock(signIn.data.user);
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  async function consumeAuthCallback(sb) {
    var params = readAuthParams();
    if (params.error || params.error_description) {
      lock();
      enterLogin();
      showMsg(decodeURIComponent(params.error_description || params.error || "Davet ba\u011flant\u0131s\u0131 ge\u00e7ersiz."), "err");
      clearAuthParamsFromUrl();
      return;
    }

    var type = String(params.type || "").toLowerCase();
    if (type === "invite" || type === "recovery" || type === "signup") {
      setPendingPassword(true);
    }

    // detectSessionInUrl already consumes ?code=; do not exchange twice.
    if (params.access_token && params.refresh_token) {
      var setRes = await sb.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token
      });
      clearAuthParamsFromUrl();
      if (setRes.error) {
        lock();
        enterLogin();
        showMsg(trError(setRes.error), "err");
        return;
      }
      if (type === "invite" || type === "recovery" || type === "signup" || pendingPassword()) {
        enterSetPassword(setRes.data.session && setRes.data.session.user);
      }
    }
  }

  async function bind() {
    bindLogout();
    setMode("login");
    var form = el("gateForm");
    if (form) form.addEventListener("submit", handleSubmit);

    if (!hasConfig()) {
      lock();
      showMsg("Supabase yap\u0131land\u0131rmas\u0131 eksik. gate-config.js dosyas\u0131n\u0131 doldurun.", "warn");
      return;
    }

    var sb = initClient();
    if (!sb) {
      lock();
      showMsg("Supabase istemcisi y\u00fcklenemedi.", "err");
      return;
    }

    await consumeAuthCallback(sb);

    sb.auth.onAuthStateChange(function (event, session) {
      if (event === "PASSWORD_RECOVERY") {
        enterSetPassword(session && session.user);
        return;
      }
      if (pendingPassword()) {
        if (session && session.user) enterSetPassword(session.user);
        else {
          enterLogin();
          lock();
        }
        return;
      }
      if (session && session.user) unlock(session.user);
      else {
        enterLogin();
        lock();
      }
    });

    var sessionRes = await sb.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if (pendingPassword()) {
      if (session && session.user) enterSetPassword(session.user);
      else {
        enterLogin();
        lock();
        showMsg("Davet oturumu bulunamad\u0131. Maildeki ba\u011flant\u0131y\u0131 yeniden a\u00e7\u0131n.", "err");
      }
    } else if (session && session.user) {
      unlock(session.user);
    } else {
      lock();
    }

    if (mode === "login") {
      var email = el("gateEmail");
      if (email) email.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
