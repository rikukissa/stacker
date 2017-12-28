import * as select from "select-dom";
import {
  getPullRequest,
  getPullRequests,
  IGithubPullRequest,
  savePullRequest
} from "../../api";
import { createIdForPullRequest, getBasePullRequest } from "../../lib/base";
import { IStackerContext } from "../../lib/context";
import { getLocation, isPullHome } from "../../lib/location";
import { updateStackerInfo } from "../../lib/prInfo";
import PRSelector, { ID } from "./components/PRSelector";

async function selectParentPullRequest(
  context: IStackerContext,
  pullRequest: IGithubPullRequest,
  pullRequests: IGithubPullRequest[],
  newParent: IGithubPullRequest
) {
  const newStackerInfo = {
    baseBranch: createIdForPullRequest(newParent)
  };
  const updatedComment = updateStackerInfo(pullRequest.body, newStackerInfo);

  const updatedPullRequest = await savePullRequest(context.accessToken)({
    ...pullRequest,
    body: updatedComment
  });

  // Update PR textarea content
  const $textarea = select('textarea[name="pull_request[body]"]');
  if ($textarea) {
    $textarea.value = updateStackerInfo($textarea.value, newStackerInfo);
  }

  return updatedPullRequest;
}

function render(
  pullRequests: IGithubPullRequest[],
  basePR: IGithubPullRequest | null,
  selectPullRequest: (pr: IGithubPullRequest) => void
) {
  const $notifications = select(".sidebar-notifications") as HTMLElement;

  if (!$notifications || !$notifications.parentElement) {
    return;
  }

  const $existingSelector = document.getElementById(ID);

  if ($existingSelector) {
    $existingSelector.remove();
  }

  $notifications.parentElement.insertBefore(
    PRSelector(pullRequests, basePR, selectPullRequest),
    $notifications
  );
}

let sidebarObserver: MutationObserver | null;
function attachMutationObserver(context: IStackerContext) {
  // Attach mutation observer
  if (sidebarObserver) {
    sidebarObserver.disconnect();
  }

  sidebarObserver = new MutationObserver(() => {
    if (sidebarObserver) {
      sidebarObserver.disconnect();
      sidebarObserver = null;
    }
    initialize(context);
  });

  const el = document.querySelector(".discussion-sidebar");

  if (el) {
    sidebarObserver.observe(el, {
      childList: true
    });
  }
}

export default async function initialize(context: IStackerContext) {
  if (!isPullHome(context.location)) {
    return;
  }

  const location = getLocation(document.location);
  const pullRequests = await getPullRequests(context.accessToken)(
    location.ownerLogin,
    location.repoName
  );

  const pullRequest = await getPullRequest(context.accessToken)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  async function selectPullRequest(newParentPR: IGithubPullRequest) {
    const updatedPullRequest = await selectParentPullRequest(
      context,
      pullRequest,
      pullRequests,
      newParentPR
    );
    const newBasePR = getBasePullRequest(updatedPullRequest, pullRequests);
    render(pullRequests, newBasePR || null, selectPullRequest);
  }

  const basePR = getBasePullRequest(pullRequest, pullRequests);

  render(pullRequests, basePR || null, selectPullRequest);

  attachMutationObserver(context);
}
