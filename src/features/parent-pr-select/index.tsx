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

import { getStackerInfo, updateStackerInfo } from "../../lib/prInfo";
import PRSelector, { ID } from "./components/PRSelector";

function updateTextareaValue(newParent: IGithubPullRequest) {
  const newStackerInfo = {
    baseBranch: createIdForPullRequest(newParent)
  };

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

  updateTextareaValue(newParent);

  return updatedPullRequest;
}

function render(
  pullRequests: IGithubPullRequest[],
  basePR: IGithubPullRequest | null,
  selectPullRequest: (pr: IGithubPullRequest) => void
) {
  const $milestone = document.querySelector(
    ".sidebar-milestone"
  ) as HTMLElement | null;

  if (!$milestone || !$milestone.parentElement) {
    return;
  }

  const $existingSelector = document.getElementById(ID);

  if ($existingSelector) {
    $existingSelector.remove();
  }

  $milestone.parentElement.insertBefore(
    PRSelector(pullRequests, basePR, selectPullRequest),
    $milestone.nextSibling
  );
}

let sidebarObserver: MutationObserver | null;
function attachMutationObserver<T>(
  context: IStackerContext,
  pathParams: T,
  callback: (context: IStackerContext, pathParams: T) => void
) {
  // Attach mutation observer
  if (sidebarObserver) {
    sidebarObserver.disconnect();
  }

  sidebarObserver = new MutationObserver(() => {
    if (sidebarObserver) {
      sidebarObserver.disconnect();
      sidebarObserver = null;
    }
    callback(context, pathParams);
  });

  const el = document.querySelector(".discussion-sidebar");

  if (el) {
    sidebarObserver.observe(el, {
      childList: true
    });
  }
}
interface IHomePathParams {
  owner: string;
  repo: string;
  prNumber: string;
}

export async function initializeHome(
  context: IStackerContext,
  pathParams: IHomePathParams
) {
  const { owner, repo, prNumber } = pathParams;
  const pullRequests = await getPullRequests(context.accessToken)(owner, repo);

  const pullRequest = await getPullRequest(context.accessToken)(
    owner,
    repo,
    prNumber
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

  attachMutationObserver(context, pathParams, initializeHome);
}

interface INewPRPathParams {
  owner: string;
  repo: string;
}

export async function initializeNewPullRequest(
  context: IStackerContext,
  pathParams: INewPRPathParams
) {
  const { owner, repo } = pathParams;
  const pullRequests = await getPullRequests(context.accessToken)(owner, repo);

  async function selectPullRequest(newParentPR: IGithubPullRequest) {
    updateTextareaValue(newParentPR);
    render(pullRequests, newParentPR, selectPullRequest);
  }
  const stackerInfo = getTextareaStackerInfo();

  const basePR = stackerInfo
    ? getBasePullRequestWithStackerInfo(stackerInfo, pullRequests)
    : null;
  render(pullRequests, basePR, selectPullRequest);

  attachMutationObserver(context, pathParams, initializeNewPullRequest);
}
