import { render } from "preact";

export function toDOMNode(vdom: JSX.Element) {
  const $wrapper = render(vdom, document.createElement("div"));
  return $wrapper;
}
