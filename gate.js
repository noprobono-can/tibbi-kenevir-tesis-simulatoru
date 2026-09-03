(function () {
  var KEY = "tkts-gate";
  var TOKEN = "v2-access";
  var cfg = window.TKTS_GATE_CONFIG || {};
  var msgTimer = null;

  function el(id) {
    return document.getElementById(id);
  }

  function codes() {
    var list = cfg.accessCodes;
    if (!Array.isArray(list)) return [];
    return list
      .map(function (c) { return String(c || "").trim(); })
      .filter(function (c) { return c.length > 0; });
  }

  function storedOk() {
    try { return sessionStorage.getItem(KEY) === TOKEN; } catch (e) { return false; }
  }

  function lock() {
    document.documentElement.classList.add("locked");
    document.documentElement.classList.remove("unlocked");
    var gate = el("gate");
    if (gate) gate.removeAttribute("hidden");
    updateSessionUi(false);
  }

  function unlock() {
    document.documentElement.classList.remove("locked");
    document.documentElement.classList.add("unlocked");
    var gate = el("gate");
    if (gate) gate.setAttribute("hidden", "");
    updateSessionUi(true);
  }

  function gt(key) {
    return (window.TKTS_i18n && window.TKTS_i18n.t("gate." + key)) || key;
  }

  function updateSessionUi(on) {
    var chip = el("gateUserChip");
    var logout = el("gateLogout");
    if (chip) {
      chip.textContent = on ? gt("session") : "";
      chip.hidden = !on;
    }
    if (logout) logout.hidden = !on;
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
    msgTimer = setTimeout(hideMsg, 3200);
  }

  function codeMatches(input) {
    var want = String(input || "").trim();
    if (!want) return false;
    var list = codes();
    for (var i = 0; i < list.length; i++) {
      if (want === list[i]) return true;
    }
    return false;
  }

  function bindLogout() {
    var btn = el("gateLogout");
    if (!btn) return;
    btn.addEventListener("click", function () {
      try { sessionStorage.removeItem(KEY); } catch (e) {}
      lock();
      var pass = el("gatePass");
      if (pass) {
        pass.value = "";
        pass.focus();
      }
    });
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    hideMsg();
    var list = codes();
    if (!list.length) {
      showMsg(gt("noCodes"), "warn");
      return;
    }
    var pass = el("gatePass");
    var value = pass ? pass.value : "";
    if (codeMatches(value)) {
      try { sessionStorage.setItem(KEY, TOKEN); } catch (e) {}
      unlock();
      return;
    }
    if (pass) pass.value = "";
    showMsg(gt("badCode"), "err");
  }

  function bind() {
    bindLogout();
    var form = el("gateForm");
    if (form) form.addEventListener("submit", handleSubmit);

    if (!codes().length) {
      lock();
      showMsg(gt("noCodes"), "warn");
      return;
    }

    if (storedOk()) unlock();
    else {
      lock();
      var pass = el("gatePass");
      if (pass) pass.focus();
    }
  }

  window.addEventListener("tkts-locale-change", function () {
    updateSessionUi(storedOk());
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
