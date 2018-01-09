import { IGithubPullRequest } from "../api";
import { getStackerInfo, IStackerInfo } from "./prInfo";

export type BaseId = string;
export interface IBase {
  id: BaseId;
  head: string;
  owner: string;
  name: string;
  selected: boolean;
}

export function isBasedOn(
  pullRequest: IGithubPullRequest,
  parentPullRequest: IGithubPullRequest
) {
  return pullRequest.base.label === parentPullRequest.head.label;
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

export function getBasePullRequestWithStackerInfo(
  stackerInfo: IStackerInfo,
  pullRequests: IGithubPullRequest[]
): IGithubPullRequest | null {
  if (!(stackerInfo && stackerInfo.baseBranch)) {
    return null;
  }
  const basePR = pullRequests.find(
    pr => createIdForPullRequest(pr) === stackerInfo.baseBranch
  );

  if (!basePR) {
    return null;
  }
  return basePR;
}

export function getBasePullRequest(
  pullRequest: IGithubPullRequest,
  pullRequests: IGithubPullRequest[]
) {
  const stackerInfo = getStackerInfo(pullRequest.body);
  if (!stackerInfo) {
    return null;
  }
  return getBasePullRequestWithStackerInfo(stackerInfo, pullRequests);
}
