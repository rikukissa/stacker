import axios from "axios";
/* tslint:disable max-classes-per-file */
export class UnauthorizedError {}
export class APILimitError {}
/* tslint:enable */

export type AccessToken = string | null;

export interface IGithubBranch {
  commit: { sha: string };
  name: string;
}

export interface IGithubOwner {
  login: string;
}

export interface IGithubRepo {
  owner: IGithubOwner;
  name: string;
}

type BranchName = string;
export interface IGithubBase {
  ref: BranchName;
  repo: IGithubRepo;
  sha: string;
  user: IGithubOwner;
}
export interface IGithubPullRequest {
  title: string;
  id: number;
  body: string;
  base: IGithubBase;
  number: number;
  head: IGithubBase;
}
export interface IGithubFork {
  fullname: string;
  owner: IGithubOwner;
  branches_url: string;
  full_name: string;
}
export interface IGithubCommit {
  sha: string;
}

async function makeRequest(
  url: string,
  accessToken: AccessToken,
  options: any = { headers: {} }
) {
  const params = accessToken
    ? {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`
        }
      }
    : options;

  return axios({
    url: url + "?" + Date.now(),
    ...params
  })
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 403) {
        throw new APILimitError();
      }
      if (err.response.status === 404) {
        throw new UnauthorizedError();
      }
      throw Error(err.response.statusText);
    });
}

export function getPullRequest(accessToken: AccessToken) {
  return (
    owner: string,
    repo: string,
    prNumber: string
  ): Promise<IGithubPullRequest> =>
    makeRequest(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      accessToken
    );
}

export function getPullRequests(accessToken: AccessToken) {
  return (owner: string, repo: string): Promise<IGithubPullRequest[]> =>
    makeRequest(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      accessToken
    );
}

export function getForks(accessToken: AccessToken) {
  return (repo: IGithubRepo) =>
    makeRequest(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/forks`,
      accessToken
    );
}

export function getBranches(accessToken: AccessToken) {
  return (repo: IGithubRepo): Promise<IGithubBranch[]> =>
    makeRequest(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/branches`,
      accessToken
    );
}

export function getPullRequestCommits(accessToken: AccessToken) {
  return (pullRequest: IGithubPullRequest): Promise<IGithubCommit[]> => {
    const repo = pullRequest.base.repo;
    return makeRequest(
      `https://api.github.com/repos/${repo.owner.login}/${repo.name}/pulls/${
        pullRequest.number
      }/commits`,
      accessToken
    );
  };
}

export function savePullRequest(accessToken: AccessToken) {
  return (pullRequest: IGithubPullRequest): Promise<IGithubPullRequest> => {
    return makeRequest(
      `https://api.github.com/repos/${pullRequest.base.repo.owner.login}/${
        pullRequest.base.repo.name
      }/pulls/${pullRequest.number}`,
      accessToken,
      {
        data: { body: pullRequest.body },
        method: "PATCH"
      }
    );
  };
}
