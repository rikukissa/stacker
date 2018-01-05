export interface IConfig {
  token: string | null;
  domains: string[];
  noAutomaticDiff: boolean;
}

type PartialConfig = { [P in keyof IConfig]?: IConfig[P] };

declare global {
  // tslint:disable-next-line interface-name
  interface Window {
    chrome: any;
  }
}

const defaultConfig = {
  domains: ["github.com"],
  noAutomaticDiff: false,
  token: null
};

export function getConfig(): Promise<IConfig> {
  return new Promise(resolve => {
    window.chrome.storage.sync.get("config", (config: PartialConfig) =>
      resolve({
        ...defaultConfig,
        ...config
      })
    );
  });
}

export async function setConfig(config: PartialConfig): Promise<IConfig> {
  const currentConfig = await getConfig();
  const newConfig: IConfig = { ...currentConfig, ...config };
  return new Promise(resolve => {
    window.chrome.storage.sync.set({ config: newConfig }, () => {
      resolve(currentConfig);
    });
  }) as Promise<IConfig>;
}
