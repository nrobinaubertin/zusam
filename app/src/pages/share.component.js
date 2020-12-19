import { h, Component } from "preact";
import { lang, me, router, http } from "/core";
import Writer from "/message/writer.component.js";
import { connectStoreon } from "storeon/preact";

class Share extends Component {
  constructor() {
    super();
    let currentUrl = new URL(window.location);
    this.state = {
      loaded: false,
      group: null,
      currentUrl,
      title: currentUrl.searchParams.get("title") || "",
      text: currentUrl.searchParams.get("text") || "",
      url: currentUrl.searchParams.get("url") || "",
      parent: currentUrl.searchParams.get("parent") || "",
      files: null
    };
    this.groupSelect = this.groupSelect.bind(this);
  }

  componentDidMount() {
    // we want to load the component with informations fetched about the user
    // BUT ONLY ONCE
    const unbind = me.on("@changed", () => loadState());
    let loadState = () => {
      if (this.state.loaded == true) {
        unbind();
        return;
      }
      let user = me.get();
      if (user.loaded == true) {
        if (user.data["default_group"]) {
          this.setState({ group: user.data["default_group"] });
          router.backUrl = `/groups/${user.data["default_group"]}`;
        } else if (user.groups.length == 1) {
            this.setState({ group: user.groups[0]["id"] });
            router.backUrl = `/groups/${user.groups[0]}`;
        }
        if (this.state.currentUrl.searchParams.get("message")) {
          http
            .get(
              `/api/messages/${  this.state.currentUrl.searchParams.get("message")}`
            )
            .then(m => {
              this.setState({
                loaded: true,
                title: (m && m.data.title) || "",
                text: (m && m.data.text) || "",
                url: "",
                files: (m && m.files) || null
              });
            });
        } else {
          this.setState({ loaded: true });
        }
        unbind();
      }
    }
  }

  groupSelect(e) {
    this.setState({ group: e.target.value });
    router.backUrl = `/groups/${e.target.value}`;
  }

  render() {
    if (!this.props.me["loaded"]) {
      return;
    }
    return (
      <article class="mt-2">
        <div class="container">
          {this.state.parent && this.props.me && this.props.me.groups.length > 1 && (
            <div class="mb-1">
              <label class="px-1" for="group_share_choice">
                {lang.t("group_share_choice")}
              </label>
              <select
                value={this.state.group}
                class="form-control"
                name="group_share_choice"
                onChange={e => this.groupSelect(e)}
                required
              >
                {this.props.me.groups.map(e => (
                  <option value={e["id"]}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
          {this.state.parent && (
            <div class="form-group">
              <label for="apiKey">
                {lang.t("parent_message")}:{" "}
              </label>
              <input
                type="text"
                name="parent_message"
                value={this.state.parent}
                class="form-control font-size-80"
                readonly="readonly"
               />
            </div>
          )}
          <Writer
            focus={true}
            group={this.state.group}
            title={this.state.title}
            parent={this.state.parent}
            text={
              this.state.text || this.state.url
                ? `${this.state.text  }\n${  this.state.url}`
                : ""
            }
            files={this.state.files}
          />
        </div>
      </article>
    );
  }
}

export default connectStoreon('me', Share)
