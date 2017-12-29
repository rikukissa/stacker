export interface ILocation {
  ownerLogin: string;
  repoName: string;
  prNumber: string;
}

export function isPRView(location: Location): boolean {
  return (
    location.href.includes("github.com") &&
    (location.href.includes("/pull") || isNewPullRequestView(location))
  );
}

export function isFilesView(location: Location) {
  return /pull\/(\d+)\/files$/.test(location.href);
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
