import { h, render } from "preact";
import { getConfig } from "../lib/config";
import Popup from "./Popup";
import withConfigState from "./withConfigState";

export default async function initialize() {
  // Dev server index.html includes a script tag running this same code
  const isPlugin = window.chrome.storage;

  if (!isPlugin) {
    return;
  }

  const config = await getConfig();

  const StatefulPopup = withConfigState(config, Popup);

  render(<StatefulPopup />, document.getElementById("stacker-popup")!);
}
