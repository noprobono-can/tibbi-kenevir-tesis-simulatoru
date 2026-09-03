(function () {
  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function enhance(select) {
    if (!select || select.dataset.darkSelect === "1") return select;
    select.dataset.darkSelect = "1";

    const wrap = document.createElement("div");
    wrap.className = "dark-select";
    if (select.classList.contains("market-select-header")) wrap.classList.add("dark-select-compact");
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dark-select-btn";
    select.classList.forEach(function (c) {
      if (c !== "dark-select-native") btn.classList.add(c);
    });
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");

    const list = document.createElement("div");
    list.className = "dark-select-list";
    list.setAttribute("role", "listbox");
    list.hidden = true;

    select.classList.add("dark-select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    wrap.insertBefore(btn, select);
    wrap.insertBefore(list, select);

    function syncFromSelect() {
      const opts = Array.from(select.options);
      list.innerHTML = opts.map(function (o) {
        const on = o.selected ? " on" : "";
        return '<div class="dark-select-item' + on + '" role="option" data-value="' + esc(o.value) + '">' + esc(o.text) + "</div>";
      }).join("");
      const sel = select.options[select.selectedIndex];
      btn.textContent = sel ? sel.text : "—";
      list.querySelectorAll(".dark-select-item").forEach(function (el) {
        el.classList.toggle("on", el.getAttribute("data-value") === select.value);
      });
    }

    function open() {
      document.querySelectorAll(".dark-select.open").forEach(function (w) {
        if (w === wrap) return;
        w.classList.remove("open");
        const l = w.querySelector(".dark-select-list");
        const b = w.querySelector(".dark-select-btn");
        if (l) l.hidden = true;
        if (b) b.setAttribute("aria-expanded", "false");
      });
      list.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      wrap.classList.add("open");
    }

    function close() {
      list.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      wrap.classList.remove("open");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (list.hidden) open();
      else close();
    });

    list.addEventListener("click", function (e) {
      const item = e.target.closest(".dark-select-item");
      if (!item) return;
      select.value = item.getAttribute("data-value");
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncFromSelect();
      close();
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape") close();
    });

    new MutationObserver(syncFromSelect).observe(select, { childList: true, subtree: true });
    select.addEventListener("change", syncFromSelect);

    if (!document.documentElement.dataset.darkSelectDoc) {
      document.documentElement.dataset.darkSelectDoc = "1";
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".dark-select")) {
          document.querySelectorAll(".dark-select.open").forEach(function (w) {
            w.classList.remove("open");
            const l = w.querySelector(".dark-select-list");
            const b = w.querySelector(".dark-select-btn");
            if (l) l.hidden = true;
            if (b) b.setAttribute("aria-expanded", "false");
          });
        }
      });
    }

    syncFromSelect();
    return select;
  }

  function enhanceAll(root) {
    const scope = root || document;
    scope.querySelectorAll("select.market-select, select.market-select-header, select.room-cultivar").forEach(enhance);
  }

  window.TKTS_darkSelect = { enhance: enhance, enhanceAll: enhanceAll };
})();
