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

export interface IGithubBase {
  ref: string;
  repo: IGithubRepo;
  sha: string;
  user: IGithubOwner;
}
export interface IGithubPullRequest {
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

async function makeRequest(url: string, accessToken: AccessToken) {
  const params = accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    : undefined;

  const response = await fetch(url, params);

  if (!response.ok) {
    if (response.status === 403) {
      throw new APILimitError();
    }
    if (response.status === 404) {
      throw new UnauthorizedError();
    }
    throw Error(response.statusText);
  }
  return response.json();
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
