import { h, Component } from "preact";
import { lang, router, alert, http, util, storage, me } from "/core";

export default class UserSettings extends Component {
  constructor(props) {
    super(props);
    this.destroyAccount = this.destroyAccount.bind(this);
    this.inputAvatar = this.inputAvatar.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.resetApiKey = this.resetApiKey.bind(this);
    this.state = Object.assign({apiKey: ""}, props);
  }

  componentDidMount() {
    storage.get("apiKey").then(apiKey => this.setState({apiKey}));
  }

  resetApiKey(event) {
    event.preventDefault();
    http.post(`/api/users/${this.state.id}/reset-api-key`, {}).then(() => router.logout());
  }

  inputAvatar() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", event => {
      import("/lazy/image-service.js").then(imageService => {
        imageService.default.handleImage(
          event.target.files[0],
          blob => {
            const formData = new FormData();
            formData.append("file", blob);
            http.post("/api/files", formData, false).then(file => {
              http
                .put(`/api/users/${this.state.id}`, { avatar: file["id"] })
                .then(() => {
                  this.setState({ avatar: file });
                  alert.add(lang.t("settings_updated"));
                });
            });
          }
        );
      });
    });
    input.click();
  }

  destroyAccount(event) {
    event.preventDefault();
    let confirmDeletion = confirm(lang.t("are_you_sure"));
    if (confirmDeletion) {
      http.delete(`/api/users/${this.state.id}`).then(() => {
        this.props.history.push("/logout");
      });
    }
  }

  updateSettings(event) {
    event.preventDefault();
    const name = document.querySelector("#settings_form input[name='name']")
      .value;
    const login = document.querySelector("#settings_form input[name='email']")
      .value;
    const password = document.querySelector(
      "#settings_form input[name='password']"
    ).value;
    const notification_emails = document.querySelector(
      "#settings_form select[name='notification_emails']"
    ).value;
    const default_group = document.querySelector(
      "#settings_form select[name='default_group']"
    ).value;
    const lang = document.querySelector("#settings_form select[name='lang']")
      .value;
    let user = {};
    if (name) {
      user.name = name;
    }
    if (login) {
      user.login = login;
    }
    if (password) {
      user.password = password;
    }
    user.data = {
      notification_emails,
      default_group,
      lang
    };
    http.put(`/api/users/${this.state.id}`, user).then(res => {
      if (res["error"]) {
        alert.add(res["error"], "alert-danger");
      } else {
        this.setState(prevState => Object.assign(prevState, res));
        location.href = util.toApp(
          `${location.pathname}?alert=settings_updated`
        );
      }
    });
  }

  render() {
    return (
      <div class="user-settings">
        <div class="card">
          <div class="identite card-body">
            <div class="container-fluid p-1">
              <div class="row">
                <div class="col-12 col-md-2">
                  <img
                    class="img-fluid rounded-circle material-shadow avatar"
                    src={
                      this.state.avatar
                        ? util.crop(this.state.avatar["id"], 100, 100)
                        : util.defaultAvatar
                    }
                    style={util.backgroundHash(this.state['id'] || "")}
                    onError={e => (e.currentTarget.src = util.defaultAvatar)}
                    onClick={e => this.inputAvatar(e)}
                  />
                </div>
                <div class="col-12 col-md-10">
                  <form id="settings_form" class="mb-3">
                    <div class="form-group">
                      <label for="name">{lang.t("name")}: </label>
                      <input
                        type="text"
                        name="name"
                        minlength="1"
                        maxlength="128"
                        placeholder={lang.t("name_input")}
                        value={this.state.name}
                        class="form-control"
                       />
                    </div>
                    <div class="form-group">
                      <label for="email">{lang.t("email")}: </label>
                      <input
                        type="email"
                        name="email"
                        placeholder={lang.t("email_input")}
                        value={this.state.login}
                        class="form-control"
                       />
                    </div>
                    <div class="form-group">
                      <label for="password">{lang.t("password")}: </label>
                      <input
                        type="password"
                        name="password"
                        autocomplete="off"
                        minlength="8"
                        maxlength="128"
                        placeholder={lang.t("password_input")}
                        class="form-control"
                       />
                    </div>
                    <div class="form-group">
                      <label for="notification_emails">
                        {lang.t("notification_emails")}:
                      </label>
                      <select
                        name="notification_emails"
                        class="form-control"
                        value={this.state.data["notification_emails"]}
                      >
                        <option value="none">{lang.t("none")}</option>
                        <option value="hourly">{lang.t("hourly")}</option>
                        <option value="daily">{lang.t("daily")}</option>
                        <option value="weekly">{lang.t("weekly")}</option>
                        <option value="monthly">{lang.t("monthly")}</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="default_group">
                        {lang.t("default_group")}:
                      </label>
                      <select
                        name="default_group"
                        class="form-control"
                        value={this.state.data["default_group"]}
                      >
                        {me.groups?.map(e => (
                          <option value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="capitalize" for="lang">
                        {lang.t("lang")}:
                      </label>
                      <select
                        name="lang"
                        class="form-control"
                        value={lang.getCurrentLang()}
                      >
                        {Object.keys(lang.possibleLang).map(k => (
                          <option value={k}>{lang.possibleLang[k]}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={e => this.updateSettings(e)}
                      class="btn btn-primary"
                    >
                      {lang.t("save_changes")}
                    </button>
                  </form>
                  <form id="api_key_form">
                    <div class="form-group">
                      <label for="apiKey">
                        {lang.t("api_key")}:{" "}
                      </label>
                      <input
                        type="text"
                        name="apiKey"
                        value={this.state.apiKey}
                        class="form-control font-size-80"
                        readonly="readonly"
                       />
                    </div>
                    <button
                      class="btn btn-outline-secondary"
                      onClick={this.resetApiKey}
                    >
                      {lang.t("reset_api_key")}
                    </button>
                  </form>
                  <form id="destroy_form">
                    <label class="d-block" for="destroy_account">
                      {lang.t("destroy_account_explain")}
                    </label>
                    <button
                      onClick={e => this.destroyAccount(e)}
                      name="destroy_account"
                      class="btn btn-danger"
                    >
                      {lang.t("destroy_account")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.alert && (
          <div class="global-alert alert alert-success">{this.state.alert}</div>
        )}
      </div>
    );
  }
}
