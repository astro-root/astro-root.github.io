(function () {
  "use strict";
  var path = window.location.pathname;
  var key = "top";
  if (path.startsWith("/projects")) key = "projects";
  else if (path.startsWith("/study")) key = "study";
  else if (path.startsWith("/blog")) key = "blog";
  else if (path.startsWith("/lab")) key = "lab";
  else if (path.startsWith("/about")) key = "about";
  else if (path.startsWith("/contact")) key = "contact";

  var links = document.querySelectorAll('[data-nav-key="' + key + '"]');
  links.forEach(function (a) { a.setAttribute("aria-current", "page"); });
})();
