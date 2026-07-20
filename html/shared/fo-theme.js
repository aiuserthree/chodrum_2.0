/* FO dark/light theme — preference in localStorage; default light when unset */
(function () {
  var KEY = "chodrum-fo-theme";

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function resolve(pref) {
    return pref === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    var t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
    try {
      document.dispatchEvent(new CustomEvent("chodrum-theme", { detail: { theme: t } }));
    } catch (e) {}
  }

  function get() {
    return resolve(stored());
  }

  function set(pref) {
    try {
      if (pref === "light" || pref === "dark") localStorage.setItem(KEY, pref);
      else localStorage.removeItem(KEY);
    } catch (e) {}
    apply(resolve(pref));
  }

  function toggle() {
    set(get() === "dark" ? "light" : "dark");
  }

  apply(get());

  window.FoTheme = { KEY: KEY, get: get, set: set, toggle: toggle, apply: apply, resolve: resolve };
})();
