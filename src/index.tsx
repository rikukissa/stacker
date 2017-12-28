import { UnauthorizedError } from "./api";
import diffSelect from "./features/diff-select";
import parentPRSelect from "./features/parent-pr-select";
import showStackingInList from "./features/show-stacking-in-list";
import { createContext } from "./lib/context";
import { isPRView } from "./lib/location";

async function run() {
  if (!isPRView(document.location)) {
    return;
  }
  const context = await createContext(document.location);
  try {
    await diffSelect(context);
    await showStackingInList(context);
    await parentPRSelect(context);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      const token = window.prompt("Please enter an access token");
      if (token) {
        window.localStorage.setItem("TODO_token", token);
        window.location.reload();
      }
    }
    // tslint:disable-next-line no-console
    console.log(err);
  }
}

const observer = new MutationObserver(run);
const el = document.querySelector("#js-repo-pjax-container");

if (el) {
  observer.observe(el, {
    childList: true
  });
}

run();
