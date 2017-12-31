import { AccessToken } from "../api";
import { getConfig } from "../lib/config";
export interface IStackerContext {
  accessToken: AccessToken | null;
}

export async function createContext(): Promise<IStackerContext> {
  const accessToken = getConfig().token;

  return {
    accessToken
  };
}
