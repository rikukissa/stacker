interface IConfig {
  token: string | null;
  noAutomaticDiff: boolean;
}

type PartialConfig = { [P in keyof IConfig]?: IConfig[P] };

const defaultConfig = {
  noAutomaticDiff: false,
  token: null
};

export function getConfig(): IConfig {
  const config = localStorage.getItem("stackerConfig");
  if (!config) {
    return defaultConfig;
  }
  return JSON.parse(config);
}

export function setConfig(opts: PartialConfig) {
  localStorage.setItem(
    "stackerConfig",
    JSON.stringify({ ...getConfig(), ...opts })
  );
}
