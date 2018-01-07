import initializeExtension from "./extension";
import initializePopup from "./popup";

if (document.getElementById("stacker-popup")) {
  initializePopup();
} else {
  initializeExtension();
}
