import axios from "axios";
import { IStackerContext } from "./lib/context";
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
  parents: Array<{ sha: string }>;
}

async function makeRequest(
  path: string,
  context: IStackerContext,
  options: any = { headers: {} }
) {
  const params = context.accessToken
    ? {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${context.accessToken}`
        }
      }
    : options;

  const nocachePath = `${path}?${Date.now()}`;

  const isGithub = context.location.host === "github.com";

  return axios({
    url: isGithub
      ? `//api.github.com${nocachePath}`
      : `//${context.location.host}/api/v3/${nocachePath}`,
    ...params
  })
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 403) {
        throw new APILimitError();
      }
      if (err.response.status === 404 || err.response.status === 401) {
        throw new UnauthorizedError();
      }
      throw Error(err.response.statusText);
    });
}

export function getPullRequest(context: IStackerContext) {
  return (
    owner: string,
    repo: string,
    prNumber: string
  ): Promise<IGithubPullRequest> =>
    makeRequest(`/repos/${owner}/${repo}/pulls/${prNumber}`, context);
}

export function getPullRequests(context: IStackerContext) {
  return (owner: string, repo: string): Promise<IGithubPullRequest[]> =>
    makeRequest(`/repos/${owner}/${repo}/pulls`, context);
}

export function getForks(context: IStackerContext) {
  return (repo: IGithubRepo) =>
    makeRequest(`/repos/${repo.owner.login}/${repo.name}/forks`, context);
}

export function getBranches(context: IStackerContext) {
  return (repo: IGithubRepo): Promise<IGithubBranch[]> =>
    makeRequest(`/repos/${repo.owner.login}/${repo.name}/branches`, context);
}

export function getPullRequestCommits(context: IStackerContext) {
  return (pullRequest: IGithubPullRequest): Promise<IGithubCommit[]> => {
    const repo = pullRequest.base.repo;
    return makeRequest(
      `/repos/${repo.owner.login}/${repo.name}/pulls/${
        pullRequest.number
      }/commits`,
      context
    );
  };
}

export function savePullRequest(context: IStackerContext) {
  return (pullRequest: IGithubPullRequest): Promise<IGithubPullRequest> => {
    return makeRequest(
      `/repos/${pullRequest.base.repo.owner.login}/${
        pullRequest.base.repo.name
      }/pulls/${pullRequest.number}`,
      context,
      {
        data: { body: pullRequest.body },
        method: "PATCH"
      }
    );
  };
}
