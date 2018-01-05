import { h } from "jsx-dom";

export default function initialize() {
  window.localStorage.setItem('foo', 'bar')

  document.body.appendChild(
    <div>
      <h1>morrrro</h1>
    </div>
  );
}
