export interface IDomain {
  domain: string;
  token: string;
}
export interface IConfig {
  domains: IDomain[];
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
  domains: [{ domain: "github.com", token: "" }],
  noAutomaticDiff: false
};

export function getConfig(): Promise<IConfig> {
  return new Promise(resolve => {
    window.chrome.storage.sync.get((config: PartialConfig) =>
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
    window.chrome.storage.sync.set(newConfig, () => {
      resolve(currentConfig);
    });
  }) as Promise<IConfig>;
}
