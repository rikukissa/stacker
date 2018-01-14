import { h } from "preact";
import { getPullRequest, getPullRequests, IGithubPullRequest } from "../../api";
import {
  createIdForPullRequest,
  getBasePullRequest,
  getBasePullRequestWithStackerInfo,
  isBasedOn
} from "../../lib/base";
import { IStackerContext } from "../../lib/context";
import { getBodyTextarea } from "../../lib/dom";
import { getLocation, getPullRequestURL, isPullHome } from "../../lib/location";
import { getStackerInfo } from "../../lib/prInfo";
import { toDOMNode } from "../../lib/vdom";

const FEATURE_INITIALIZED_FLAG = "stacker-merge-warning-initialized";

function markUninitialized($comment: Element) {
  $comment.classList.remove(FEATURE_INITIALIZED_FLAG);
}

function markInitialized($comment: Element) {
  $comment.classList.add(FEATURE_INITIALIZED_FLAG);
}

function getTextareaStackerInfo() {
  const $textarea = getBodyTextarea();
  return $textarea && getStackerInfo($textarea.value);
}
const WARNING_ID = "stacker-merge-warning";

function getChildPullRequests(
  pullRequest: IGithubPullRequest,
  pullRequests: IGithubPullRequest[]
) {
  const id = createIdForPullRequest(pullRequest);

  return pullRequests.filter(pr => {
    const base = getBasePullRequest(pr, pullRequests);

    if (!base) {
      return false;
    }
    return createIdForPullRequest(base) === id;
  });
}

function BasedChildrenWarning(pullRequests: IGithubPullRequest[]) {
  return (
    <p id={WARNING_ID}>
      ⚠️ &nbsp;This pull request has following child pull requests:<br />
      <ul>
        {pullRequests.map(pr => (
          <li data-stacker-pr={createIdForPullRequest(pr)}>
            <strong>
              <a href={getPullRequestURL(pr)} target="_blank">
                #{pr.number} {pr.title}
              </a>
            </strong>
          </li>
        ))}
      </ul>
      Consider merging all children before merging to upstream.
    </p>
  );
}

function ParentPullRequestWarning(pullRequest: IGithubPullRequest) {
  return (
    <p id={WARNING_ID} data-stacker-pr={createIdForPullRequest(pullRequest)}>
      ⚠️ &nbsp;This pull request depends on{" "}
      <strong>
        <a href={getPullRequestURL(pullRequest)} target="_blank">
          #{pullRequest.number} {pullRequest.title}
        </a>
      </strong>. Consider merging it before merging this one.
    </p>
  );
}

function render(node: JSX.Element, $container: Element) {
  if (!$container.lastElementChild) {
    return;
  }
  $container.insertBefore(
    toDOMNode(node),
    $container.lastElementChild.nextSibling
  );
}

export default async function initialize(context: IStackerContext) {
  if (!isPullHome(context.location)) {
    return;
  }

  const $comment = document.querySelector(".comment-body");

  if (!$comment) {
    return;
  }

  markUninitialized($comment);

  const location = getLocation(context.location);

  const pullRequests = await getPullRequests(context)(
    location.ownerLogin,
    location.repoName
  );

  const pullRequest = await getPullRequest(context)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  const stackerInfo = getTextareaStackerInfo();
  const parentPullRequest =
    stackerInfo && getBasePullRequestWithStackerInfo(stackerInfo, pullRequests);

  // Handle existing warning
  const $warning = document.getElementById(WARNING_ID);
  if ($warning) {
    if (!parentPullRequest) {
      // Clear existing warning
      $warning.remove();
      return;
    }

    if (
      createIdForPullRequest(parentPullRequest) ===
      $warning.getAttribute("data-stacker-pr")
    ) {
      // Keep existing warning
      return;
    }
  }

  const basedPullRequests = getChildPullRequests(
    pullRequest,
    pullRequests
  ).filter(child => isBasedOn(child, pullRequest));

  if (basedPullRequests.length > 0) {
    render(BasedChildrenWarning(basedPullRequests), $comment);

    markInitialized($comment);
    return;
  }

  // Not based on anything
  if (!parentPullRequest) {
    return;
  }

  const isBasedOnParent = isBasedOn(pullRequest, parentPullRequest);

  if (isBasedOnParent) {
    markInitialized($comment);
    return;
  }

  render(ParentPullRequestWarning(parentPullRequest), $comment);

  markInitialized($comment);
}
