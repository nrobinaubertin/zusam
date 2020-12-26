import { h, Component } from "preact";
import { lang, alert, http, router, util, me } from "/core";
import { withRouter } from "react-router-dom";

class GroupSettings extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
    this.leave = this.leave.bind(this);
    this.resetSecretKey = this.resetSecretKey.bind(this);
    this.state = Object.assign({ hydratedUsers: [] }, props);
  }

  resetSecretKey(event) {
    event.preventDefault();
    http
      .post(`/api/groups/${this.state.id}/reset-invite-key`, {})
      .then(res => {
        alert.add(lang.t("group_updated"));
        this.setState({ secretKey: res["inviteKey"] });
      });
  }

  updateSettings(event) {
    event.preventDefault();
    const name = document.querySelector("#settings_form input[name='name']")
      .value;
    let group = {};
    if (name) {
      group.name = name;
    }
    http.put(`/api/groups/${  this.state.id}`, group).then(res => {
      alert.add(lang.t("group_updated"));
      this.setState(prevState => Object.assign(prevState, res));
    });
  }

  leaveGroup(event) {
    event.preventDefault();
    if (me.data?.default_group == this.state.id) {
      let user = {};
      user.data = { default_group: me.groups[0].id };
      http.put(`/api/users/${me.id}`, user).then(() => {
        this.props.dispatch('me/fetch');
        this.leave();
      });
    } else {
      this.leave();
    }
  }

  leave() {
    http.post(`/api/groups/${  this.state.id  }/leave`, {}).then(res => {
      if (!res || !res["entityType"]) {
        alert.add(lang.t("error"), "alert-danger");
      } else {
        this.props.dispatch('me/fetch');
        alert.add(lang.t("group_left"));
        this.props.history.push("/");
      }
    });
  }

  render() {
    return (
      <div>
        <div class="group-settings mb-3">
          <div class="card">
            <div class="card-body">
              <div class="container-fluid p-1">
                <div class="row">
                  <div class="col-12 col-md-10">
                    <form id="settings_form" class="mb-1 border-bottom pb-1">
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
                          required
                         />
                      </div>
                      <button
                        onClick={this.updateSettings}
                        class="btn btn-outline-secondary"
                      >
                        {lang.t("save_changes")}
                      </button>
                    </form>
                    <form class="mb-1 border-bottom pb-1">
                      <div class="form-group">
                        <label for="inviteKey">
                          {lang.t("invitation_link")}:{" "}
                        </label>
                        <input
                          type="text"
                          name="inviteKey"
                          value={
                            `${location.protocol}//${location.host}/invitation/${this.state.secretKey}`
                          }
                          class="form-control font-size-80"
                          readonly="readonly"
                         />
                      </div>
                      <button
                        class="btn btn-outline-secondary"
                        onClick={this.resetSecretKey}
                      >
                        {lang.t("reset_invitation_link")}
                      </button>
                    </form>
                    <form>
                      <button
                        onClick={e => this.leaveGroup(e)}
                        class="btn btn-outline-danger"
                      >
                        {lang.t("quit_group")}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="user-list mb-3">
          <h3>{lang.t("users")}</h3>
          {this.props.users.map(
            user =>
              user && (
                <div class="user-card">
                  <img
                    class="avatar material-shadow-with-hover"
                    style={util.backgroundHash(user.id)}
                    src={
                      user.avatar
                        ? util.crop(user.avatar["id"], 200, 200)
                        : util.defaultAvatar
                    }
                    onError={e => (e.currentTarget.src = util.defaultAvatar)}
                  />
                  <span>{user["name"]}</span>
                </div>
              )
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(GroupSettings);
