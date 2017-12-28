import { IGithubPullRequest } from "../api";
import { getStackerInfo } from "./prInfo";

export type BaseId = string;
export interface IBase {
  id: BaseId;
  head: string;
  owner: string;
  name: string;
  selected: boolean;
}

export function createId(owner: string, repo: string, branchName: string) {
  return `${owner}:${repo}:${branchName}`;
}
export function createIdForPullRequest(pullRequest: IGithubPullRequest) {
  return createId(
    pullRequest.base.repo.owner.login,
    pullRequest.base.repo.name,
    pullRequest.head.ref
  );
}

export function getBasePullRequest(
  pullRequest: IGithubPullRequest,
  pullRequests: IGithubPullRequest[]
) {
  const stackerInfo = getStackerInfo(pullRequest);

  return (
    stackerInfo &&
    stackerInfo.baseBranch &&
    pullRequests.find(
      pr => createIdForPullRequest(pr) === stackerInfo.baseBranch
    )
  );
}
