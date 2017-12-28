import { AccessToken } from "../api";
import { getConfig } from "../lib/config";
export interface IStackerContext {
  location: Location;
  accessToken: AccessToken | null;
}

export async function createContext(
  location: Location
): Promise<IStackerContext> {
  const accessToken = getConfig().token;

  return {
    accessToken,
    location
  };
}
