import {
  getPullRequest,
  getPullRequests,
  IGithubPullRequest,
  savePullRequest
} from "../../api";
import {
  createIdForPullRequest,
  getBasePullRequest,
  getBasePullRequestWithStackerInfo
} from "../../lib/base";
import { IStackerContext } from "../../lib/context";
import { getBodyTextarea } from "../../lib/dom";
import {
  getLocation,
  isNewPullRequestView,
  isPullHome
} from "../../lib/location";
import {
  getStackerInfo,
  IStackerInfo,
  updateStackerInfo
} from "../../lib/prInfo";
import { toDOMNode } from "../../lib/vdom";
import PRSelector, { ID } from "./components/PRSelector";

function updateTextareaValue(newStackerInfo: IStackerInfo) {
  const $textarea = getBodyTextarea();
  if ($textarea) {
    $textarea.value = updateStackerInfo($textarea.value, newStackerInfo);
  }
}

function getTextareaStackerInfo() {
  const $textarea = getBodyTextarea();
  return $textarea && getStackerInfo($textarea.value);
}

async function selectParentPullRequest(
  context: IStackerContext,
  pullRequest: IGithubPullRequest,
  pullRequests: IGithubPullRequest[],
  selectedParent: IGithubPullRequest
) {
  const currentParent = getBasePullRequest(pullRequest, pullRequests);
  const newParent =
    currentParent === selectedParent
      ? null
      : createIdForPullRequest(selectedParent);

  const newStackerInfo = {
    baseBranch: newParent
  };
  const updatedComment = updateStackerInfo(pullRequest.body, newStackerInfo);

  const updatedPullRequest = await savePullRequest(context)({
    ...pullRequest,
    body: updatedComment
  });

  updateTextareaValue(newStackerInfo);

  return updatedPullRequest;
}

function render(
  pullRequests: IGithubPullRequest[],
  parentPR: IGithubPullRequest | null,
  selectPullRequest: (pr: IGithubPullRequest) => void
) {
  const $milestone = document.querySelector(
    ".sidebar-progress-bar"
  ) as HTMLElement | null;

  if (!$milestone || !$milestone.parentElement) {
    return;
  }

  const $existingSelector = document.getElementById(ID);

  if ($existingSelector) {
    $existingSelector.remove();
  }

  $milestone.parentElement.insertBefore(
    toDOMNode(PRSelector(pullRequests, parentPR, selectPullRequest)),
    $milestone.nextSibling
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

async function initializeHome(context: IStackerContext) {
  if (
    !isPullHome(context.location) &&
    !isNewPullRequestView(context.location)
  ) {
    return;
  }

  const location = getLocation(document.location);

  const pullRequest = await getPullRequest(context)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  const pullRequests = (await getPullRequests(context)(
    location.ownerLogin,
    location.repoName
  )).filter(pr => pr.id !== pullRequest.id);

  async function selectPullRequest(newParentPR: IGithubPullRequest) {
    const updatedPullRequest = await selectParentPullRequest(
      context,
      pullRequest,
      pullRequests,
      newParentPR
    );
    const parentPR = getBasePullRequest(updatedPullRequest, pullRequests);
    render(pullRequests, parentPR || null, selectPullRequest);
  }

  const newParent = getBasePullRequest(pullRequest, pullRequests);

  render(pullRequests, newParent || null, selectPullRequest);
}

async function initializeNewPullRequest(context: IStackerContext) {
  const location = getLocation(document.location);
  const pullRequests = await getPullRequests(context)(
    location.ownerLogin,
    location.repoName
  );

  async function selectPullRequest(newParentPR: IGithubPullRequest) {
    updateTextareaValue({
      baseBranch:
        newParentPR === parentPR ? null : createIdForPullRequest(newParentPR)
    });
    render(pullRequests, newParentPR, selectPullRequest);
  }
  const stackerInfo = getTextareaStackerInfo();

  const parentPR = stackerInfo
    ? getBasePullRequestWithStackerInfo(stackerInfo, pullRequests)
    : null;
  render(pullRequests, parentPR, selectPullRequest);
}

export default async function initialize(context: IStackerContext) {
  if (isPullHome(context.location)) {
    await initializeHome(context);
    attachMutationObserver(context);
  }

  if (isNewPullRequestView(context.location)) {
    await initializeNewPullRequest(context);
    attachMutationObserver(context);
  }
}
