import { AccessToken } from "../api";

export interface IStackerContext {
  location: Location;
  accessToken: AccessToken;
}

export async function createContext(
  location: Location
): Promise<IStackerContext> {
  const accessToken = window.localStorage.getItem("TODO_token");

  return {
    accessToken,
    location
  };
}
