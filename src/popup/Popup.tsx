import { css } from "emotion";
import { h } from "preact";
import { IConfig, IDomain } from "../lib/config";

const popup = css`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
  color: #24292e;
`;

const option = css`
  padding: 1em;
`;

const optionHeader = css`
  display: flex;
  align-items: center;
  padding: 1em;
  background: #f6f8fa;
`;

const optionTitle = css`
  font-size: 20px;
  font-weight: normal;
  flex-grow: 1;
  margin: 0;
`;

const label = css`
  text-align: left;
  font-weight: 600;
  padding-bottom: 4px;
`;

const button = css`
  position: relative;
  display: inline-block;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  background-repeat: repeat-x;
  background-position: -1px -1px;
  background-size: 110% 110%;
  border: 1px solid rgba(27, 31, 35, 0.2);
  border-radius: 0.25em;
  appearance: none;
  &:active {
    background-color: #e9ecef;
    background-image: none;
    border-color: rgba(27, 31, 35, 0.35);
    box-shadow: inset 0 0.15em 0.3em rgba(27, 31, 35, 0.15);
  }
  &:hover {
    background-color: #e6ebf1;
    background-image: linear-gradient(-180deg, #f0f3f6 0%, #e6ebf1 90%);
    background-position: 0 -0.5em;
    border-color: rgba(27, 31, 35, 0.35);
  }
`;

const input = css`
  padding: 6px 8px;
  font-size: 14px;
  line-height: 20px;
  vertical-align: middle;
  border: 1px solid #d1d5da;
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
`;

const actionLink = css`
  color: #586069;
  border: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const domains = css`
  width: 100%;
  margin-top: 1em;
`;

const link = css`
  color: #0366d6;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// const domainStatus = css`
//   background: #c2e0c6;
//   padding: 5px 12px;
//   text-align: center;
//   font-size: 16px;
//   border-radius: 5px;
// `;

export type Status = [IDomain, boolean];

export interface IProps {
  config: IConfig;
  statuses: Status[];
  onAddDomain: () => void;
  onDeleteDomain: (domain: IDomain) => void;
  onDomainChanged: (oldDomain: IDomain, domain: IDomain) => void;
}

export default function Popup({
  config,
  onAddDomain,
  onDeleteDomain,
  onDomainChanged
}: IProps) {
  return (
    <div className={popup}>
      <div>
        <header className={optionHeader}>
          <h2 className={optionTitle}>Github domains</h2>
          <button className={button} onClick={onAddDomain}>
            Add new domain
          </button>
        </header>
        <section className={option}>
          {config.domains.length === 0 &&
            "Add a domain to let Stacker do its thing ✨"}
          {config.domains.length > 0 && (
            <table className={domains}>
              <thead>
                <tr>
                  <th className={label}>Domain</th>
                  <th className={label}>
                    Access token&nbsp;
                    <a
                      className={link}
                      target="_blank"
                      href="https://github.com/settings/tokens"
                    >
                      (?)
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody>
                {config.domains.map(domain => (
                  <tr>
                    <td>
                      <input
                        className={input}
                        type="text"
                        placeholder="github.com"
                        value={domain.domain}
                        onChange={event =>
                          onDomainChanged(domain, {
                            ...domain,
                            domain: (event.target as HTMLInputElement).value
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className={input}
                        type="password"
                        value={domain.token}
                        onChange={event =>
                          onDomainChanged(domain, {
                            ...domain,
                            token: (event.target as HTMLInputElement).value
                          })
                        }
                      />
                    </td>
                    {/* <td className={domainStatus}>👍</td> */}
                    <td>
                      <button
                        className={actionLink}
                        onClick={() => onDeleteDomain(domain)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
