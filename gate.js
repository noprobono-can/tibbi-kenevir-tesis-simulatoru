(function () {
  var cfg = window.TKTS_GATE_CONFIG || {};
  var client = null;
  var msgTimer = null;

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
    if (!client) client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    return client;
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
      msgTimer = setTimeout(hideMsg, 4200);
    }
  }

  function trError(error) {
    var m = (error && error.message) ? error.message : "Bir hata olu\u015ftu.";
    if (m.indexOf("Invalid login credentials") >= 0) {
      return "E-posta veya \u015fifre hatal\u0131. Davet mailindeki ba\u011flant\u0131yla \u015fifrenizi ayarlad\u0131\u011f\u0131n\u0131zdan emin olun.";
    }
    if (m.indexOf("Email not confirmed") >= 0) {
      return "Davet hen\u00fcz tamamlanmad\u0131. E-postadaki ba\u011flant\u0131y\u0131 a\u00e7\u0131p \u015fifrenizi belirleyin.";
    }
    if (m.indexOf("Signups not allowed") >= 0 || m.indexOf("signup is disabled") >= 0) {
      return "A\u00e7\u0131k kay\u0131t kapal\u0131. Eri\u015fim i\u00e7in y\u00f6neticiden davet isteyin.";
    }
    if (m.indexOf("Password should be at least") >= 0) return "\u015eifre en az 6 karakter olmal\u0131.";
    if (m.indexOf("Unable to validate email address") >= 0) return "Ge\u00e7erli bir e-posta adresi girin.";
    return m;
  }

  function bindLogout() {
    var btn = el("gateLogout");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var sb = initClient();
      if (sb) sb.auth.signOut();
      else lock();
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
    var emailEl = el("gateEmail");
    var passEl = el("gatePass");
    var email = emailEl ? String(emailEl.value || "").trim().toLowerCase() : "";
    var pass = passEl ? String(passEl.value || "") : "";
    if (!email || !pass) {
      showMsg("E-posta ve \u015fifre gerekli.", "err");
      return;
    }
    var submit = el("gateSubmit");
    if (submit) submit.disabled = true;
    try {
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

  async function bind() {
    bindLogout();
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

    var sessionRes = await sb.auth.getSession();
    if (sessionRes.data && sessionRes.data.session) {
      unlock(sessionRes.data.session.user);
    } else {
      lock();
    }

    sb.auth.onAuthStateChange(function (_event, session) {
      if (session && session.user) unlock(session.user);
      else lock();
    });

    var email = el("gateEmail");
    if (email) email.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
