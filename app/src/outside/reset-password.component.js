import { h, Component } from "preact";
import { lang, alert, storage, http, router } from "/core";
import { withRouter } from "react-router-dom";

class ResetPassword extends Component {
  constructor() {
    super();
    this.sendNewPassword = this.sendNewPassword.bind(this);
  }

  sendNewPassword(e) {
    e.preventDefault();
    storage.set("apiKey", "");
    const password = document.getElementById("password").value || "";
    const passwordConfirmation = document.getElementById("password_confirmation").value || "";
    const mail = router.getParam("mail");
    const key = router.getParam("key");
    if (mail && password) {
      if (password != passwordConfirmation) {
        alert.add(lang.t("passwords_dont_match"));
        return;
      }
      http
        .post("/api/new-password", { mail, key, password })
        .then(res => {
          if (res.api_key) {
            storage.set("apiKey", res.api_key);
            setTimeout(() => this.props.history.push("/"), 100);
          } else {
            alert.add(lang.t(res.message));
          }
        })
        .catch(res => console.warn(res));
    }
  }

  render() {
    return (
      <div class="login">
        <div class="login-form">
          <h2 class="title">{lang.t("reset_password_title")}</h2>
          <form>
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                required
                id="password"
                placeholder={lang.t("new_password_placeholder")}
              />
            </div>
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                required
                id="password_confirmation"
                placeholder={lang.t("confirm_password_placeholder")}
              />
            </div>
            <button
              type="submit"
              class="btn btn-light"
              onClick={e => this.sendNewPassword(e)}
            >
              {lang.t("submit")}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(ResetPassword);
