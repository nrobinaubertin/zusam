import { h, Component } from "preact";
import { http, lang } from "/core";
import UserSettings from "./user-settings.component.js";
import GroupSettings from "./group-settings.component.js";
import { Navbar } from "/navbar";
import { Link } from "react-router-dom";
import { connectStoreon } from 'storeon/preact'

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    http.get(`/api/${this.props.type}/${this.props.id}`).then(
      res => {
        this.setState({entity: res});
      }
    );
  }

  render() {
    if (!this.state.entity || !this.props.me.id) {
      return;
    }
    return (
      <main>
        <Navbar />
        <div class="content">
          <article class="mt-2 justify-content-center d-flex">
            <div class="container pb-3">
              <div class="settings">
                <ul class="nav nav-tabs">
                  <li class="nav-item">
                    <Link
                      class={`nav-link${this.state.entity["entityType"] == "user" ? " active" : ""}`}
                      to={`/users/${this.props.me.id}/settings`}
                    >
                      {lang.t("account")}
                    </Link>
                  </li>
                  {this.props.me.groups?.length > 0 && (
                    <li
                      class="nav-item dropdown group-list"
                      tabindex="-1"
                      onClick={e => e.currentTarget.classList.toggle("active")}
                    >
                      <div
                        class={`nav-link${this.state.entity["entityType"] == "group" ? " active" : ""}`}
                      >
                        {lang.t("groups")}
                      </div>
                      <div class="dropdown-menu">
                        {this.props.me.groups?.map(e => (
                          <Link
                            class="seamless-link"
                            to={`/groups/${e.id}/settings`}
                          >
                            {e.name}
                          </Link>
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
            </div>
          </article>
        </div>
      </main>
    );
  }
}

export default connectStoreon('me', Settings)
