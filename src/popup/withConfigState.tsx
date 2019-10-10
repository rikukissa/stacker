import { AnyComponent, Component, h } from "preact";
import { checkToken } from "../api";
import { IConfig, IDomain, setConfig } from "../lib/config";
import { IProps, IStatus } from "./Popup";

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
  try {
    await checkToken(domain.domain, domain.token);
    return true;
  } catch (err) {
    return false;
  }
}

type ActionHandler = (
  oldConfig: IConfig,
  ...params: any[]
) => Promise<IConfig> | IConfig;

interface IState {
  config: IConfig | null;
  statuses: IStatus[];
}

export default function withConfigState(
  config: IConfig,
  WrappedComponent: AnyComponent<IProps, any>
) {
  return class extends Component<any, IState> {
    public state = {
      config: null,
      statuses: []
    };
    public async componentDidMount() {
      const statuses = await Promise.all(
        config.domains
          .filter(({ token }) => token !== "")
          .map(async domain => {
            const valid = await getStatus(domain);
            return { domain, valid };
          })
      );
      this.setState((state: IState) => ({ config, statuses }));
    }

    public checkStatus = async (oldDomain: IDomain, domain: IDomain) => {
      await this.actionAndRerender(domainChanged)(oldDomain, domain);

      if (domain.token === "") {
        return;
      }

      const valid = await getStatus(domain);

      this.setState((state: IState) => ({
        ...state,
        statuses: state.statuses.concat({ domain, valid })
      }));
    };

    public render() {
      if (!this.state.config) {
        return <div />;
      }
      return (
        <WrappedComponent
          config={this.state.config!}
          statuses={this.state.statuses}
          onAddDomain={this.actionAndRerender(addDomain)}
          onDeleteDomain={this.actionAndRerender(deleteDomain)}
          onDomainChanged={this.checkStatus}
        />
      );
    }

    private actionAndRerender(handler: ActionHandler) {
      return async (...args: any[]) => {
        const newConfig = await handler(this.state.config!, ...args);
        this.setState({ config: newConfig });
        return newConfig;
      };
    }
  };
}
