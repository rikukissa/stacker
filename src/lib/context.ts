import { AccessToken, IGithubPullRequest } from "../api";
import { IBase } from "./base";

export interface IStackerContext {
  location: Location;
  accessToken: AccessToken;
  pullRequest: IGithubPullRequest;
  head: IBase;
  base: IBase;
}
