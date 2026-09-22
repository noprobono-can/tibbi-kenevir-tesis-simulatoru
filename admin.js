(function () {
  var ADMIN_SESSION_KEY = "tkts-admin-session";
  var USERS_STORE_KEY = "tkts-workspace-users-v1";
  var DENY_STORE_KEY = "tkts-workspace-users-deny-v1";
  var cfg = window.TKTS_GATE_CONFIG || {};
  var auth = window.TKTS_passwordAuth;

  function el(id) {
    return document.getElementById(id);
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
          return id ? { id: id, label: u, source: "config" } : null;
        }
        var uid = normalizeId(u.id);
        if (!uid) return null;
        return { id: uid, label: String(u.label || uid), source: "config" };
      })
      .filter(Boolean);
  }

  function readLocalUsers() {
    try {
      var raw = localStorage.getItem(USERS_STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(function (u) {
          var uid = normalizeId(u && u.id);
          if (!uid) return null;
          return { id: uid, label: String((u && u.label) || uid), source: "local" };
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function writeLocalUsers(list) {
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(list.map(function (u) {
      return { id: u.id, label: u.label };
    })));
  }

  function readDeny() {
    try {
      var raw = localStorage.getItem(DENY_STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeId).filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }

  function writeDeny(list) {
    localStorage.setItem(DENY_STORE_KEY, JSON.stringify(list));
  }

  function mergedUsers() {
    var deny = {};
    readDeny().forEach(function (id) { deny[id] = true; });
    var map = {};
    configUsers().forEach(function (u) {
      if (deny[u.id]) return;
      map[u.id] = u;
    });
    readLocalUsers().forEach(function (u) {
      if (deny[u.id]) return;
      map[u.id] = {
        id: u.id,
        label: u.label,
        source: map[u.id] ? "both" : "local"
      };
    });
    return Object.keys(map).sort().map(function (k) { return map[k]; });
  }

  function adminOk() {
    try { return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"; } catch (e) { return false; }
  }

  function setAdminOk(on) {
    try {
      if (on) sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {}
  }

  function showMsg(id, text, kind) {
    var n = el(id);
    if (!n) return;
    n.textContent = text || "";
    n.className = "admin-msg" + (kind ? (" " + kind) : "");
    n.hidden = !text;
  }

  function renderList() {
    var list = el("adminUserList");
    if (!list) return;
    var users = mergedUsers();
    if (!users.length) {
      list.innerHTML = "<li><div><strong>Henüz kullanıcı yok</strong><small>Yukarıdan ekleyin</small></div></li>";
      return;
    }
    list.innerHTML = users.map(function (u) {
      var hasPass = auth && auth.hasStoredPassword(u.id);
      var src = u.source === "config" ? "repo" : (u.source === "both" ? "repo + yerel" : "yalnızca yerel");
      return "<li data-id=\"" + u.id + "\">" +
        "<div><strong>" + u.label + "</strong><small>" + u.id + " · " + src +
        (hasPass ? " · şifre tanımlı (bu tarayıcı)" : " · şifre bekliyor") +
        "</small></div>" +
        "<div class=\"row-actions\">" +
        (hasPass ? "<button type=\"button\" data-act=\"reset\">Şifre sıfırla</button>" : "") +
        "<button type=\"button\" data-act=\"remove\">Kaldır</button>" +
        "</div></li>";
    }).join("");
  }

  function showPanel(on) {
    el("adminLogin").hidden = !!on;
    el("adminPanel").hidden = !on;
    if (on) renderList();
  }

  function exportConfig() {
    var users = mergedUsers().map(function (u) {
      return "    { id: \"" + u.id + "\", label: \"" + String(u.label).replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\" }";
    }).join(",\n");
    var adminPass = String(cfg.adminPassword || "chronos").replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    var body = "window.TKTS_GATE_CONFIG = {\n" +
      "  // Admin panel password (admin.html). Keep private.\n" +
      "  adminPassword: \"" + adminPass + "\",\n" +
      "  // Allowed usernames. First login: user sets their own password (stored in browser).\n" +
      "  users: [\n" + users + "\n" +
      "  ]\n" +
      "};\n";
    var blob = new Blob([body], { type: "application/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gate-config.js";
    a.click();
    URL.revokeObjectURL(a.href);
    showMsg("adminPanelMsg", "gate-config.js indirildi. Repoya koyup commit/push edin.", "ok");
  }

  function bind() {
    el("adminLoginForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var want = String(cfg.adminPassword || "");
      var got = el("adminPass").value;
      if (!want) {
        showMsg("adminLoginMsg", "gate-config.js içinde adminPassword tanımlı değil.", "err");
        return;
      }
      if (got !== want) {
        el("adminPass").value = "";
        showMsg("adminLoginMsg", "Admin şifresi hatalı.", "err");
        return;
      }
      setAdminOk(true);
      showMsg("adminLoginMsg", "", "");
      showPanel(true);
    });

    el("adminAddForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var id = normalizeId(el("newUserId").value);
      var label = String(el("newUserLabel").value || id).trim() || id;
      if (!id) {
        showMsg("adminPanelMsg", "Geçerli bir kullanıcı adı girin (a-z, 0-9, ._-).", "err");
        return;
      }
      if (mergedUsers().some(function (u) { return u.id === id; })) {
        showMsg("adminPanelMsg", "Bu kullanıcı adı zaten var.", "err");
        return;
      }
      writeDeny(readDeny().filter(function (d) { return d !== id; }));
      var local = readLocalUsers();
      local.push({ id: id, label: label });
      writeLocalUsers(local);
      el("newUserId").value = "";
      el("newUserLabel").value = "";
      renderList();
      showMsg("adminPanelMsg", id + " eklendi. Yayın için gate-config.js indirin.", "ok");
    });

    el("adminUserList").addEventListener("click", function (ev) {
      var btn = ev.target.closest("button[data-act]");
      if (!btn) return;
      var li = btn.closest("li[data-id]");
      if (!li) return;
      var id = li.getAttribute("data-id");
      var act = btn.getAttribute("data-act");

      if (act === "reset") {
        if (!auth) return;
        if (!window.confirm(id + " için bu tarayıcıdaki şifre silinsin mi? Kullanıcı ilk girişte yeniden oluşturur.")) return;
        auth.clearStoredPassword(id);
        renderList();
        showMsg("adminPanelMsg", id + " şifresi sıfırlandı.", "ok");
        return;
      }

      if (act === "remove") {
        if (id === "okan") {
          showMsg("adminPanelMsg", "okan hesabı kaldırılamaz.", "err");
          return;
        }
        if (!window.confirm(id + " kaldırılsın mı?")) return;
        writeLocalUsers(readLocalUsers().filter(function (u) { return u.id !== id; }));
        var deny = readDeny();
        if (deny.indexOf(id) < 0) deny.push(id);
        writeDeny(deny);
        if (auth) auth.clearStoredPassword(id);
        renderList();
        showMsg("adminPanelMsg", id + " kaldırıldı. Kalıcı yayın için gate-config.js indirin.", "ok");
      }
    });

    el("adminExportBtn").addEventListener("click", exportConfig);
    el("adminLogoutBtn").addEventListener("click", function () {
      setAdminOk(false);
      el("adminPass").value = "";
      showPanel(false);
    });

    showPanel(adminOk());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
