import { IGithubPullRequest } from "../api";

interface IStackerInfo {
  baseBranch: string;
}

export function getStackerInfo(pr: IGithubPullRequest): IStackerInfo | null {
  const matches = pr.body.match(/<!--(.*)-->/);
  if (!matches) {
    return null;
  }
  const [, json] = matches;

  try {
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}
