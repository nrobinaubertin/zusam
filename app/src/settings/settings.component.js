import { h, Component } from "preact";
import { http, lang, router, me, util } from "/core";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.entityUrl) {
      http.get(props.entityUrl).then(res => this.setState({ entity: res }));
    }
  }

  render() {
    if (!this.state.entity || !me.id) {
      return;
    }
    return (
      <div class="settings">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a
              class={
                `nav-link${ 
                this.state.entity["entityType"] == "user" ? " active" : ""}`
              }
              href={util.toApp(`/users/${me.id}/settings`)}
              onClick={e => router.onClick(e)}
            >
              {lang.t("account")}
            </a>
          </li>
          {me.groups?.length > 0 && (
            <li
              class="nav-item dropdown group-list"
              tabindex="-1"
              onClick={e => e.currentTarget.classList.toggle("active")}
            >
              <div
                class={
                  `nav-link${ 
                  this.state.entity["entityType"] == "group" ? " active" : ""}`
                }
              >
                {lang.t("groups")}
              </div>
              <div class="dropdown-menu">
                {me.groups?.map(e => (
                  <a
                    class="seamless-link"
                    href={util.toApp(`/groups/${  e.id  }/settings`)}
                    onClick={e => router.onClick(e)}
                  >
                    {e.name}
                  </a>
                ))}
              </div>
            </li>
          )}
        </ul>
        {this.state.entity["entityType"] === "user" && (
          <UserSettings {...this.state.entity} />
        )}
        {this.state.entity["entityType"] === "group" && (
          <GroupSettings {...this.state.entity} />
        )}
      </div>
    );
  }
}
