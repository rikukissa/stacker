import { css } from "emotion";
import { getPullRequest, getPullRequests } from "../api";
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

  const pullRequests = await getPullRequests(context.accessToken)(
    location.ownerLogin,
    location.repoName
  );

  const pullRequest = await getPullRequest(context.accessToken)(
    location.ownerLogin,
    location.repoName,
    location.prNumber
  );

  const basePR = getBasePullRequest(pullRequest, pullRequests);
  if (!basePR) {
    return;
  }

  const lastCommitSHA = basePR.head.sha;

  const $commits = Array.from(
    document.querySelectorAll(".timeline-commits .commit")
  );
  const $parentHeadCommit = $commits.find(el => {
    const $commitId = el.querySelector(".commit-id");
    if (!$commitId) {
      return false;
    }
    return lastCommitSHA.startsWith($commitId.innerHTML);
  });
  if (!$parentHeadCommit) {
    return;
  }
  $commits.slice(0, $commits.indexOf($parentHeadCommit)).forEach($commit => {
    $commit.classList.add(faded);
  });
}
