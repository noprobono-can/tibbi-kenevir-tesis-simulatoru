(function () {
  var KEY = "tkts-gate";
  var TOKEN = "v1-9c2e4a71";
  var errTimer = null;

  function expectedUser() {
    return String.fromCharCode(97, 100, 109, 105, 110);
  }
  function expectedPass() {
    return String.fromCharCode(99, 104, 114, 111, 110, 111, 115);
  }

  function storedOk() {
    try { return sessionStorage.getItem(KEY) === TOKEN; } catch (e) { return false; }
  }

  function unlock() {
    document.documentElement.classList.remove("locked");
    document.documentElement.classList.add("unlocked");
    var gate = document.getElementById("gate");
    if (gate) gate.setAttribute("hidden", "");
  }

  function showErr() {
    var n = document.getElementById("gateErr");
    if (!n) return;
    n.hidden = false;
    if (errTimer) clearTimeout(errTimer);
    errTimer = setTimeout(function () { n.hidden = true; }, 2800);
  }

  function bind() {
    if (storedOk()) {
      unlock();
      return;
    }
    document.documentElement.classList.add("locked");
    document.documentElement.classList.remove("unlocked");
    var form = document.getElementById("gateForm");
    var user = document.getElementById("gateUser");
    var pass = document.getElementById("gatePass");
    if (user) user.focus();
    if (!form) return;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var u = user ? String(user.value || "").trim() : "";
      var p = pass ? String(pass.value || "") : "";
      if (u === expectedUser() && p === expectedPass()) {
        try { sessionStorage.setItem(KEY, TOKEN); } catch (e) {}
        unlock();
        return;
      }
      if (pass) pass.value = "";
      showErr();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
