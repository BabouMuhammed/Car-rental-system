/**
 * Dashboard page behavior:
 * - Marks the correct dashboard tab as active based on location hash (optional)
 * - If tabs have hrefs, this still works without JS
 */
(function () {
  function initDashboardTabs() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    const nav = topbar.querySelector("nav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll("a"));
    if (!links.length) return;

    function setActiveByHash() {
      const hash = (window.location.hash || "").replace("#", "").toLowerCase();
      if (!hash) return;

      links.forEach((a) => a.classList.remove("active"));
      const match = links.find((a) => (a.getAttribute("data-tab") || "").toLowerCase() === hash);
      if (match) match.classList.add("active");
    }

    // Enable click-to-activate when using hash navigation
    links.forEach((a) => {
      a.addEventListener("click", () => {
        const tab = (a.getAttribute("data-tab") || "").trim();
        if (tab) window.location.hash = tab;
      });
    });

    window.addEventListener("hashchange", setActiveByHash);
    setActiveByHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardTabs);
  } else {
    initDashboardTabs();
  }
})();

