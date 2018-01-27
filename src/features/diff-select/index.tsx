import { h } from "preact";
import {
  checkUrlValidity,
  getPullRequest,
  getPullRequestCommits,
  getPullRequests,
  IGithubCommit,
  IGithubPullRequest,
  checkUrlValidity
} from "../../api";
import { getBasePullRequest, isBasedOn } from "../../lib/base";
import { getConfig, setConfig } from "../../lib/config";
import { IStackerContext } from "../../lib/context";
import { getLocation, isFilesDiffView, isFilesView } from "../../lib/location";
import { toDOMNode } from "../../lib/vdom";

async function getNewCommits(
  context: IStackerContext,
  pullRequest: IGithubPullRequest,
  parentPullRequest: IGithubPullRequest
): Promise<IGithubCommit[]> {
  const commits = await getPullRequestCommits(context)(pullRequest);
  const parentCommits = await getPullRequestCommits(context)(parentPullRequest);

  return commits.filter(
    commit =>
      !parentCommits.find(parentCommit => parentCommit.sha === commit.sha)
  );
}

function getDiffViewUrl(
  currentLocation: Location,
  commits: IGithubCommit[]
): string | null {
  if (commits.length === 1) {
    return (
      currentLocation.pathname.replace(/files$/, `commits/${commits[0].sha}`) +
      currentLocation.hash
    );
  } else if (commits.length > 1) {
    return (
      currentLocation.pathname +
      // TODO this is a too big of an assumption
      // https://softwareengineering.stackexchange.com/questions/314215/can-a-git-commit-have-more-than-2-parents
      `/${commits[0].parents[0].sha}..${commits[commits.length - 1].sha}` +
      currentLocation.hash
    );
  } else {
    return null;
  }
}

async function redirectToPullRequestView(
  context: IStackerContext,
  newCommits: IGithubCommit[]
) {
  const newUrl = getDiffViewUrl(context.location, newCommits);

  if (newUrl) {
    await checkUrlValidity(context, newUrl);
    window.location.href = newUrl;
  }
}

function markInitialized() {
  document.body.classList.add("stacker-diff-view-initialized");
}

function markUninitialized() {
  document.body.classList.remove("stacker-diff-view-initialized");
}

export default async function initialize(context: IStackerContext) {
  markUninitialized();

  const config = await getConfig();
  const $stats = document.querySelector(".float-right.pr-review-tools");

  if (isFilesView(context.location) && $stats && $stats.parentElement) {
    const location = getLocation(document.location);

    const pullRequest = await getPullRequest(context)(
      location.ownerLogin,
      location.repoName,
      location.prNumber
    );

    const pullRequests = await getPullRequests(context)(
      location.ownerLogin,
      location.repoName
    );

    const parentPullRequest = getBasePullRequest(pullRequest, pullRequests);

    if (!parentPullRequest || isBasedOn(pullRequest, parentPullRequest)) {
      return markInitialized();
    }

    const newCommits = await getNewCommits(
      context,
      pullRequest,
      parentPullRequest
    );

    if (!config.noAutomaticDiff) {
      try {
        await redirectToPullRequestView(context, newCommits);
      } catch (err) {
        return markInitialized();
      }
    }

    const diffViewUrl = getDiffViewUrl(context.location, newCommits);

    const $existingNotification = document.getElementById(
      "stacker-files-notification"
    );
    if ($existingNotification) {
      $existingNotification.remove();
    }

    if (diffViewUrl) {
      $stats.parentElement.insertBefore(
        toDOMNode(
          <div
            id="stacker-files-notification"
            onClick={() => setConfig({ noAutomaticDiff: false })}
            className="subset-files-tab"
          >
            Viewing all changes.{" "}
            <a className="stale-files-tab-link" href={diffViewUrl}>
              🔎 &nbsp;View only this PR
            </a>
          </div>
        ),
        $stats
      );
    }
  }

  if (isFilesDiffView(context.location)) {
    const $viewAllLink = document.querySelector(".stale-files-tab-link");

    if ($viewAllLink) {
      $viewAllLink.addEventListener("click", () => {
        setConfig({ noAutomaticDiff: true });
      });
    }

    markInitialized();
  }
}
