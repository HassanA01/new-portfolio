(function () {
  var cookie = (document.cookie || "").split("; ").find(function (entry) {
    return entry.indexOf("theme=") === 0;
  });
  var preference = cookie ? cookie.slice(6) : undefined;
  try {
    if (preference !== "light" && preference !== "dark")
      preference = localStorage.getItem("theme");
  } catch {
    // Storage can be unavailable in private or restricted browsing.
  }
  var theme =
    preference === "light" || preference === "dark"
      ? preference
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  document.documentElement.dataset.theme = theme;
})();
