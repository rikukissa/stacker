import { AccessToken } from "../api";
import { IDomain } from "../lib/config";
export interface IStackerContext {
  location: Location;
  accessToken: AccessToken | null;
}

export async function createContext(
  location: Location,
  configDomain: IDomain
): Promise<IStackerContext> {
  const accessToken = configDomain.token;

  return {
    accessToken,
    location
  };
}
