import { UnauthorizedError } from "./api";
import diffSelect from "./features/diff-select";
import fadeOutUnrelatedCommits from "./features/fade-out-unrelated-commits";
import mergeWarning from "./features/merge-warning";
import parentPRSelect from "./features/parent-pr-select";
import showStackingInList from "./features/show-stacking-in-list";
import { getConfig, setConfig } from "./lib/config";
import { createContext } from "./lib/context";
import { isPRView } from "./lib/location";

function promptForToken() {
  const token = window.prompt("Please enter an access token");
  if (token) {
    setConfig({ token });
    window.location.reload();
  }
}

async function run() {
  if (!isPRView(document.location)) {
    return;
  }

  const token = getConfig().token;

  if (!token) {
    return promptForToken();
  }

  const context = await createContext(document.location);
  try {
    await diffSelect(context);
    await showStackingInList(context);
    await parentPRSelect(context);
    await fadeOutUnrelatedCommits(context);
    await mergeWarning(context);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      promptForToken();
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
