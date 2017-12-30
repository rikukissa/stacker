import { h } from "dom-chef";
import {
  getPullRequest,
  getPullRequestCommits,
  getPullRequests,
  IGithubCommit
} from "../api";
import { getBasePullRequest } from "../lib/base";
import { getConfig, setConfig } from "../lib/config";
import { IStackerContext } from "../lib/context";
import { getLocation, isFilesDiffView, isFilesView } from "../lib/location";

async function getNewCommits(
  context: IStackerContext
): Promise<IGithubCommit[]> {
  const location = getLocation(document.location);
  const pullRequest = await getPullRequest(context.accessToken)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  const pullRequests = await getPullRequests(context.accessToken)(
    location.ownerLogin,
    location.repoName
  );

  const basePullRequest = getBasePullRequest(pullRequest, pullRequests);

  if (!basePullRequest) {
    return Promise.resolve([]);
  }

  const commits = await getPullRequestCommits(context.accessToken)(pullRequest);
  const parentCommits = await getPullRequestCommits(context.accessToken)(
    basePullRequest
  );

  return commits.filter(
    commit =>
      !parentCommits.find(parentCommit => parentCommit.sha === commit.sha)
  );
}

function getDiffViewUrl(commits: IGithubCommit[]): string | null {
  if (commits.length === 1) {
    return window.location.href.replace(/files$/, `commits/${commits[0].sha}`);
  } else if (commits.length > 1) {
    return (
      window.location.href +
      `/${commits[0].sha}..${commits[commits.length - 1].sha}`
    );
  } else {
    return null;
  }
}

async function redirectToPullRequestView(
  context: IStackerContext,
  newCommits: IGithubCommit[]
) {
  const newUrl = getDiffViewUrl(newCommits);
  if (newUrl) {
    window.location.href = newUrl;
  }
}

export default async function initialize(context: IStackerContext) {
  const config = getConfig();

  if (isFilesView(context.location)) {
    const newCommits = await getNewCommits(context);
    if (!config.noAutomaticDiff) {
      return redirectToPullRequestView(context, newCommits);
    }

    const $stats = document.querySelector(".float-right.pr-review-tools");
    const diffViewUrl = getDiffViewUrl(newCommits);

    const $existingNotification = document.getElementById(
      "stacker-files-notification"
    );
    if ($existingNotification) {
      $existingNotification.remove();
    }

    if ($stats && $stats.parentElement && diffViewUrl) {
      $stats.parentElement.insertBefore(
        <div
          id="stacker-files-notification"
          onClick={() => setConfig({ noAutomaticDiff: false })}
          className="subset-files-tab"
        >
          Viewing all changes.{" "}
          <a className="stale-files-tab-link" href={diffViewUrl}>
            🔎 &nbsp;View only this PR
          </a>
        </div>,
        $stats
      );
    }
  }

  if (isFilesDiffView(context.location)) {
    const $viewAllLink = document.querySelector(".stale-files-tab-link");

    if (!$viewAllLink) {
      return;
    }

    $viewAllLink.addEventListener("click", () => {
      setConfig({ noAutomaticDiff: true });
    });
  }
}
