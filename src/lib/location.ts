export interface ILocation {
  ownerLogin: string;
  repoName: string;
  prNumber: string;
}

export function isPRView(location: Location): boolean {
  return (
    location.href.includes("github.com") && location.href.includes("/pull/")
  );
}

export function isFilesView(location: Location) {
  return /pull\/(\d+)\/files/.test(location.href);
}

export function getLocation(location: Location): ILocation {
  const [ownerLogin, repoName, , prNumber] = location.pathname
    .split("/")
    .filter(part => part !== "");
  return { ownerLogin, repoName, prNumber };
}
