// import { UnauthorizedError } from "./api";
// import diffSelect from "./features/diff-select";
// import fadeOutUnrelatedCommits from "./features/fade-out-unrelated-commits";
// import mergeWarning from "./features/merge-warning";
import {
  initializeHome,
  initializeNewPullRequest
} from "./features/parent-pr-select";
// import showStackingInList from "./features/show-stacking-in-list";
// import { setConfig } from "./lib/config";
import { createContext } from "./lib/context";

// import { isPRView } from "./lib/location";
import createRouter from "./lib/router";

createRouter({
  "/:owner/:repo/:prNumber": async ({ repo, owner, prNumber }) => {
    const context = await createContext();
    await initializeHome(context, { repo, owner, prNumber });
  },
  "/:owner/:repo/compare/*": async ({ repo, owner }) => {
    const context = await createContext();
    await initializeNewPullRequest(context, { repo, owner });
  }
});

// async function run() {
//   if (!isPRView(document.location)) {
//     return;
//   }
//   const context = await createContext(document.location);
//   try {
//     await diffSelect(context);
//     await showStackingInList(context);
// await parentPRSelect(context);
//     await fadeOutUnrelatedCommits(context);
//     await mergeWarning(context);
//   } catch (err) {
//     if (err instanceof UnauthorizedError) {
//       const token = window.prompt("Please enter an access token");
//       if (token) {
//         setConfig({ token });
//         window.location.reload();
//       }
//     }
//     // tslint:disable-next-line no-console
//     console.log(err);
//   }
// }

// const observer = new MutationObserver(run);
// const el = document.querySelector("#js-repo-pjax-container");

// if (el) {
//   observer.observe(el, {
//     childList: true
//   });
// }

// run();
