import diffSelect from "./features/diff-select";
import fadeOutUnrelatedCommits from "./features/fade-out-unrelated-commits";
import mergeWarning from "./features/merge-warning";
import parentPRSelect from "./features/parent-pr-select";
import showStackingInList from "./features/show-stacking-in-list";
import { getConfig } from "./lib/config";
import { createContext } from "./lib/context";
import { getConfigDomain, isPRView } from "./lib/location";

async function run() {
  const config = await getConfig();

  const configDomain = getConfigDomain(location, config);

  if (!configDomain || !isPRView(document.location, config)) {
    return;
  }

  const context = await createContext(document.location, configDomain);
  try {
    await diffSelect(context);
    await showStackingInList(context);
    await parentPRSelect(context);
    await fadeOutUnrelatedCommits(context);
    await mergeWarning(context);
  } catch (err) {
    // TODO show error somewhere
    // tslint:disable-next-line no-console
    console.log(err);
  }
}

export default function initialize() {
  const observer = new MutationObserver(run);
  const el = document.querySelector("#js-repo-pjax-container");

  if (el) {
    observer.observe(el, {
      childList: true
    });
  }

  run();
}
