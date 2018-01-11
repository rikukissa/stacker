import { IGithubPullRequest } from "../api";
import { IConfig, IDomain } from "./config";

export interface ILocation {
  ownerLogin: string;
  repoName: string;
  prNumber: string;
}

export function getConfigDomain(
  location: Location,
  config: IConfig
): IDomain | null {
  return (
    config.domains.find(domain => location.href.includes(domain.domain)) || null
  );
}

export function isPRView(location: Location, config: IConfig): boolean {
  return location.href.includes("/pull") || isNewPullRequestView(location);
}

export function isFilesView(location: Location) {
  return /pull\/(\d+)\/files$/.test(location.pathname);
}

export function isFilesDiffView(location: Location) {
  return /pull\/(\d+)\/files\/[a-z0-9]+\.\.[a-z0-9]+$/i.test(location.href);
}

export function isPullHome(location: Location) {
  return /pull\/(\d+)$/.test(location.href);
}

export function isNewPullRequestView(location: Location) {
  return /\/compare\//.test(location.href);
}

export function isPullsListView(location: Location) {
  return /pulls/.test(location.href);
}

export function getLocation(location: Location): ILocation {
  const [ownerLogin, repoName, , prNumber] = location.pathname
    .split("/")
    .filter(part => part !== "");
  return { ownerLogin, repoName, prNumber };
}

export function getOwner(location: Location) {
  return getLocation(location).ownerLogin;
}

export function getRepo(location: Location) {
  return getLocation(location).repoName;
}

export function getPullRequestURL(pullRequest: IGithubPullRequest) {
  return `/${pullRequest.base.repo.owner.login}/${
    pullRequest.base.repo.name
  }/pull/${pullRequest.number}`;
}
