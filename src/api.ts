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
      if (err.status === 403) {
        throw new APILimitError();
      }
      if (err.status === 404) {
        throw new UnauthorizedError();
      }
      throw Error(err.statusText);
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
