(function () {
  // Theme toggle: follows the OS until the visitor picks one.
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current =
        root.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  // Release filters on /releases/.
  var filters = document.querySelectorAll("[data-filter]");
  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      var product = button.getAttribute("data-filter");
      filters.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === button));
      });
      document.querySelectorAll("[data-product]").forEach(function (el) {
        el.hidden = product !== "all" && el.getAttribute("data-product") !== product;
      });
    });
  });

  // Version badges and the "latest releases" strip on the home page.
  // releases.json is written at build time by scripts/fetch-releases.mjs.
  var badges = document.querySelectorAll("[data-version]");
  var latest = document.querySelector("[data-latest-releases]");
  if (!badges.length && !latest) return;

  fetch("/static/data/releases.json")
    .then(function (r) {
      return r.ok ? r.json() : Promise.reject(r.status);
    })
    .then(function (data) {
      badges.forEach(function (badge) {
        var product = data.products[badge.getAttribute("data-version")];
        if (product && product.latest) badge.textContent = product.latest;
      });

      if (!latest || !data.releases.length) return;
      latest.textContent = "";
      data.releases.slice(0, 5).forEach(function (rel) {
        var li = document.createElement("li");

        var time = document.createElement("time");
        time.dateTime = rel.date;
        time.textContent = rel.date.slice(0, 10);

        var product = document.createElement("span");
        product.className = "product";
        product.textContent = rel.productName;

        var summary = document.createElement("span");
        summary.className = "summary";
        summary.textContent = rel.summary || "";

        var link = document.createElement("a");
        link.className = "tag version";
        link.href = "/releases/#" + rel.id;
        link.textContent = rel.tag;

        li.append(time, product, summary, link);
        latest.appendChild(li);
      });
    })
    .catch(function () {
      /* Keep the static fallback. */
    });
})();

// Nagare diagrams with animations play once; replay them on a loop.
(function () {
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("svg[data-loop]").forEach(function (svg) {
    if (typeof svg.setCurrentTime !== "function") return;
    if (still) {
      svg.pauseAnimations();
      return;
    }
    var seconds = parseFloat(svg.getAttribute("data-loop")) || 6;
    setInterval(function () {
      svg.setCurrentTime(0);
    }, seconds * 1000);
  });
})();
