import { h } from "jsx-dom";
import { getPullRequests } from "../api";
import {
  createIdForPullRequest,
  getBasePullRequestWithStackerInfo
} from "../lib/base";
import { IStackerContext } from "../lib/context";
import { getBodyTextarea } from "../lib/dom";
import { getLocation, getPullRequestURL } from "../lib/location";
import { getStackerInfo } from "../lib/prInfo";

function getTextareaStackerInfo() {
  const $textarea = getBodyTextarea();
  return $textarea && getStackerInfo($textarea.value);
}
const WARNING_ID = "stacker-merge-warning";
export default async function initialize(context: IStackerContext) {
  const $comment = document.querySelector(".comment-body");

  const location = getLocation(context.location);

  const pullRequests = await getPullRequests(context)(
    location.ownerLogin,
    location.repoName
  );

  const stackerInfo = getTextareaStackerInfo();
  const basePR =
    stackerInfo && getBasePullRequestWithStackerInfo(stackerInfo, pullRequests);

  // Handle existing warning
  const $warning = document.getElementById(WARNING_ID);
  if ($warning) {
    if (!basePR) {
      // Clear existing warning
      $warning.remove();
      return;
    }

    if (
      createIdForPullRequest(basePR) ===
      $warning.getAttribute("data-stacker-pr")
    ) {
      // Keep existing warning
      return;
    }
  }

  if (!(stackerInfo && $comment && $comment.firstElementChild)) {
    return;
  }

  if (!basePR) {
    return;
  }

  $comment.insertBefore(
    <p id={WARNING_ID} data-stacker-pr={createIdForPullRequest(basePR)}>
      ⚠️ &nbsp;This pull request depends on{" "}
      <strong>
        <a href={getPullRequestURL(basePR)} target="_blank">
          #{basePR.number} {basePR.title}
        </a>
      </strong>. Consider merging it before merging this one.
    </p>,
    $comment.firstElementChild.nextSibling
  );
}
