var script = document.createElement("script");
script.src = "https://localhost:3000/static/js/bundle.js";

(document.head || document.documentElement).appendChild(script);
script.onload = function() {
  script.parentNode.removeChild(script);
};
