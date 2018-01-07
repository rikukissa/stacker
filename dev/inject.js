const src = "https://localhost:3000/static/js/bundle.js";

fetch(src)
  .then(res => res.text())
  .then(script => eval(script));
