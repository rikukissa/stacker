import initializeExtension from "./extension";
import initializePopup from "./popup";

declare global {
  // tslint:disable-next-line interface-name
  interface Window {
    STACKER_POPUP: boolean;
  }
}

if (document.getElementById('stacker-popup')) {
  initializePopup();
} else {
  initializeExtension();
}
