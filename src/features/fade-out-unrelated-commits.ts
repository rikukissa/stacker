import { css } from "emotion";
import { getPullRequest, getPullRequestCommits, getPullRequests } from "../api";
import { getBasePullRequest } from "../lib/base";
import { IStackerContext } from "../lib/context";
import { getLocation, isPullHome } from "../lib/location";

const faded = css`
  opacity: 0.5;
`;

export default async function initialize(context: IStackerContext) {
  if (!isPullHome(context.location)) {
    return;
  }
  const location = getLocation(document.location);

  const pullRequests = await getPullRequests(context)(
    location.ownerLogin,
    location.repoName
  );

  const pullRequest = await getPullRequest(context)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  const basePR = getBasePullRequest(pullRequest, pullRequests);
  if (!basePR) {
    return;
  }

  const commits = await getPullRequestCommits(context)(basePR);

  const $commits = Array.from(
    document.querySelectorAll(".timeline-commits .commit")
  );

  $commits.forEach($commit => {
    const $sha = $commit.querySelector(".commit-id");
    if (!$sha) {
      return;
    }
    if (commits.find(commit => commit.sha.startsWith($sha.innerHTML))) {
      $commit.classList.add(faded);
    }
  });
}
