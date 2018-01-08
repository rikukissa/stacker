import { AnyComponent, Component, h } from "preact";
import { IConfig, IDomain, setConfig } from "../lib/config";
import { IProps, Status } from "./Popup";

/*
 * State mutators
 */

function isValidDomain(domain: IDomain) {
  return domain.domain !== "";
}

function storeConfig(config: IConfig) {
  return setConfig({
    ...config,
    domains: config.domains.filter(isValidDomain)
  });
}

async function addDomain(config: IConfig) {
  const newConfig = {
    ...config,
    domains: config.domains.concat({ domain: "", token: "" })
  };
  await storeConfig(newConfig);
  return newConfig;
}

async function deleteDomain(config: IConfig, domain: IDomain) {
  const newConfig = {
    ...config,
    domains: config.domains.filter(d => d !== domain)
  };
  await storeConfig(newConfig);
  return newConfig;
}

async function domainChanged(
  config: IConfig,
  oldDomain: IDomain,
  domain: IDomain
) {
  const newConfig = {
    ...config,
    domains: config.domains.map(d => (d === oldDomain ? domain : d))
  };

  await storeConfig(newConfig);

  return newConfig;
}

async function getStatus(domain: IDomain) {
  return true;
}

type ActionHandler = (
  oldConfig: IConfig,
  ...params: any[]
) => Promise<IConfig> | IConfig;

interface IState {
  config: IConfig;
  statuses: Status[];
}

export default function withConfigState(
  config: IConfig,
  WrappedComponent: AnyComponent<IProps, any>
) {
  return class extends Component<any, IState> {
    constructor() {
      super();
      this.state.config = config;
      this.state.statuses = [];
    }
    public async componentDidMount() {
      const statuses = await Promise.all(
        this.state.config.domains.map(async domain => {
          const status = await getStatus(domain);
          return [domain, status];
        })
      );
      this.setState(() => ({ statuses }));
    }
    public render() {
      return (
        <WrappedComponent
          config={this.state.config}
          statuses={this.state.statuses}
          onAddDomain={this.actionAndRerender(addDomain)}
          onDeleteDomain={this.actionAndRerender(deleteDomain)}
          onDomainChanged={this.actionAndRerender(domainChanged)}
        />
      );
    }

    private actionAndRerender(handler: ActionHandler) {
      return async (...args: any[]) => {
        this.setState({ config: await handler(this.state.config, ...args) });
      };
    }
  };
}
