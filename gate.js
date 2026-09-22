(function () {
  var KEY = "tkts-gate";
  var USERS_STORE_KEY = "tkts-workspace-users-v1";
  var TOKEN = "v2-access";
  var cfg = window.TKTS_GATE_CONFIG || {};
  var auth = window.TKTS_passwordAuth;
  var msgTimer = null;
  var step = "username"; // username | login | setup
  var resolvedUserId = null;

  function el(id) {
    return document.getElementById(id);
  }

  function gt(key, params) {
    return (window.TKTS_i18n && window.TKTS_i18n.t("gate." + key, params)) || key;
  }

  function normalizeId(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "");
  }

  function configUsers() {
    var list = cfg.users;
    if (!Array.isArray(list)) return [];
    return list
      .map(function (u) {
        if (!u) return null;
        if (typeof u === "string") {
          var id = normalizeId(u);
          return id ? { id: id, label: u } : null;
        }
        var uid = normalizeId(u.id);
        if (!uid) return null;
        return { id: uid, label: String(u.label || uid) };
      })
      .filter(Boolean);
  }

  function localUsers() {
    try {
      var raw = localStorage.getItem(USERS_STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(function (u) {
          var uid = normalizeId(u && u.id);
          if (!uid) return null;
          return { id: uid, label: String((u && u.label) || uid) };
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function deniedUsers() {
    try {
      var raw = localStorage.getItem("tkts-workspace-users-deny-v1");
      if (!raw) return {};
      var list = JSON.parse(raw);
      if (!Array.isArray(list)) return {};
      var map = {};
      list.forEach(function (id) {
        var n = normalizeId(id);
        if (n) map[n] = true;
      });
      return map;
    } catch (e) {
      return {};
    }
  }

  function workspaceUsers() {
    var deny = deniedUsers();
    var map = {};
    configUsers().concat(localUsers()).forEach(function (u) {
      if (deny[u.id]) return;
      map[u.id] = u;
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function resolveUsername(username) {
    var id = normalizeId(username);
    if (!id) return null;
    var hit = workspaceUsers().find(function (u) { return u.id === id; });
    return hit ? hit.id : null;
  }

  function getUserLabel(userId) {
    var hit = workspaceUsers().find(function (u) { return u.id === userId; });
    return hit ? hit.label : userId;
  }

  function readSession() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      if (raw === "v2-access" || raw === "v1-access") {
        return { userId: "okan", token: TOKEN };
      }
      var parsed = JSON.parse(raw);
      if (parsed && parsed.token === TOKEN && parsed.userId && resolveUsername(parsed.userId)) {
        return { userId: parsed.userId, token: TOKEN };
      }
    } catch (e) {}
    return null;
  }

  function writeSession(userId) {
    sessionStorage.setItem(KEY, JSON.stringify({ userId: userId, token: TOKEN }));
  }

  function clearSession() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  function lock() {
    document.documentElement.classList.add("locked");
    document.documentElement.classList.remove("unlocked");
    var gate = el("gate");
    if (gate) gate.removeAttribute("hidden");
    updateSessionUi(null);
  }

  function unlock(userId) {
    document.documentElement.classList.remove("locked");
    document.documentElement.classList.add("unlocked");
    var gate = el("gate");
    if (gate) gate.setAttribute("hidden", "");
    updateSessionUi(userId);
  }

  function updateSessionUi(userId) {
    var chip = el("gateUserChip");
    var logout = el("gateLogout");
    var changeBtn = el("gateChangePass");
    if (chip) {
      chip.textContent = userId ? getUserLabel(userId) : "";
      chip.hidden = !userId;
    }
    if (logout) logout.hidden = !userId;
    if (changeBtn) changeBtn.hidden = !userId;
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
    msgTimer = setTimeout(hideMsg, 4200);
  }

  function setStep(next) {
    step = next;
    var userField = el("gateUser");
    var passWrap = el("gatePassWrap");
    var confirmWrap = el("gateConfirmWrap");
    var submit = el("gateSubmit");
    var back = el("gateBack");
    var lead = el("gateLead");
    var title = el("gateTitle");

    if (userField) userField.readOnly = step !== "username";

    if (passWrap) passWrap.hidden = step === "username";
    if (confirmWrap) confirmWrap.hidden = step !== "setup";
    if (back) back.hidden = step === "username";

    if (lead) {
      if (step === "setup") lead.textContent = gt("leadSetup");
      else if (step === "login") lead.textContent = gt("leadLogin");
      else lead.textContent = gt("lead");
    }
    if (title) {
      if (step === "setup") title.textContent = gt("titleSetup");
      else if (step === "login") title.textContent = gt("titleLogin");
      else title.textContent = gt("title");
    }
    if (submit) {
      if (step === "username") submit.textContent = gt("continue");
      else if (step === "setup") submit.textContent = gt("createPass");
      else submit.textContent = gt("submit");
    }

    var pass = el("gatePass");
    var confirm = el("gateConfirm");
    if (pass) pass.value = "";
    if (confirm) confirm.value = "";
    if (pass) pass.required = step !== "username";
    if (confirm) confirm.required = step === "setup";

    if (step === "username" && userField) userField.focus();
    else if (pass) pass.focus();
  }

  function completeUnlock(userId) {
    writeSession(userId);
    unlock(userId);
    return true;
  }

  function handleUsernameContinue() {
    var userField = el("gateUser");
    var username = userField ? userField.value : "";
    var userId = resolveUsername(username);
    if (!userId) {
      showMsg(gt("unknownUser"), "err");
      resolvedUserId = null;
      return;
    }
    if (!auth) {
      showMsg(gt("authMissing"), "err");
      return;
    }
    resolvedUserId = userId;
    hideMsg();
    setStep(auth.hasStoredPassword(userId) ? "login" : "setup");
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    hideMsg();

    if (step === "username") {
      handleUsernameContinue();
      return;
    }

    if (!auth || !resolvedUserId) {
      setStep("username");
      showMsg(gt("unknownUser"), "err");
      return;
    }

    var pass = el("gatePass");
    var confirm = el("gateConfirm");
    var password = pass ? pass.value : "";
    var confirmPassword = confirm ? confirm.value : "";
    var strengthError = auth.validatePasswordStrength(password);
    if (strengthError) {
      showMsg(strengthError, "err");
      return;
    }

    var submit = el("gateSubmit");
    if (submit) submit.disabled = true;

    var done = function () {
      if (submit) submit.disabled = false;
    };

    if (step === "setup") {
      if (password !== confirmPassword) {
        showMsg(gt("passMismatch"), "err");
        done();
        return;
      }
      if (auth.hasStoredPassword(resolvedUserId)) {
        showMsg(gt("alreadyHasPass"), "err");
        done();
        setStep("login");
        return;
      }
      auth.createStoredPassword(resolvedUserId, password).then(function () {
        completeUnlock(resolvedUserId);
      }).catch(function () {
        showMsg(gt("setupFail"), "err");
      }).then(done);
      return;
    }

    auth.verifyStoredPassword(resolvedUserId, password).then(function (ok) {
      if (!ok) {
        if (pass) pass.value = "";
        showMsg(gt("badLogin"), "err");
        return;
      }
      completeUnlock(resolvedUserId);
    }).catch(function () {
      showMsg(gt("badLogin"), "err");
    }).then(done);
  }

  function openChangePassword() {
    var session = readSession();
    if (!session || !auth) return;
    var current = window.prompt(gt("changeCurrent"));
    if (current == null) return;
    var next = window.prompt(gt("changeNew", { n: auth.MIN_PASSWORD_LENGTH }));
    if (next == null) return;
    var strengthError = auth.validatePasswordStrength(next);
    if (strengthError) {
      window.alert(strengthError);
      return;
    }
    var again = window.prompt(gt("changeConfirm"));
    if (again !== next) {
      window.alert(gt("passMismatch"));
      return;
    }
    auth.changeStoredPassword(session.userId, current, next).then(function (result) {
      if (result === "success") window.alert(gt("changeOk"));
      else window.alert(gt("changeFail"));
    });
  }

  function bind() {
    var form = el("gateForm");
    if (form) form.addEventListener("submit", handleSubmit);

    var back = el("gateBack");
    if (back) {
      back.addEventListener("click", function () {
        resolvedUserId = null;
        hideMsg();
        setStep("username");
        var userField = el("gateUser");
        if (userField) {
          userField.readOnly = false;
          userField.focus();
        }
      });
    }

    var logout = el("gateLogout");
    if (logout) {
      logout.addEventListener("click", function () {
        clearSession();
        resolvedUserId = null;
        lock();
        setStep("username");
        var userField = el("gateUser");
        if (userField) {
          userField.value = "";
          userField.readOnly = false;
          userField.focus();
        }
      });
    }

    var changeBtn = el("gateChangePass");
    if (changeBtn) changeBtn.addEventListener("click", openChangePassword);

    if (!workspaceUsers().length) {
      lock();
      setStep("username");
      showMsg(gt("noUsers"), "warn");
      return;
    }

    var session = readSession();
    if (session) unlock(session.userId);
    else {
      lock();
      setStep("username");
    }
  }

  window.TKTS_gate = {
    workspaceUsers: workspaceUsers,
    resolveUsername: resolveUsername,
    getUserLabel: getUserLabel,
    readSession: readSession,
    USERS_STORE_KEY: USERS_STORE_KEY,
    normalizeId: normalizeId
  };

  window.addEventListener("tkts-locale-change", function () {
    var session = readSession();
    updateSessionUi(session ? session.userId : null);
    if (!session) setStep(step);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
