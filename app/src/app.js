import { h, Component } from "preact";
import { alert, lang, storage, router, cache, api, me } from "/core";
import { Navbar } from "/navbar";
import { MainContent } from "/pages";
import {
  Login,
  Public,
  ResetPassword,
  Signup,
  StopNotificationEmails
} from "/outside";

export default class App extends Component {
  constructor() {
    super();

    // load api infos
    api.update();

    // cache management
    cache.purgeOldCache();

    this.onRouterStateChange = this.onRouterStateChange.bind(this);
    window.addEventListener("routerStateChange", this.onRouterStateChange);
    window.addEventListener("fetchedNewDict", () => this.setState({}));
    window.addEventListener("popstate", router.sync);
    window.addEventListener("click", e => {
      if (!e.target.closest(".dropdown")) {
        // close dropdowns if we are clicking on something else
        document
          .querySelectorAll(".dropdown")
          .forEach(n => n.classList.remove("active"));
      } else {
        // close dropdowns that are not clicked on
        document
          .querySelectorAll(".dropdown")
          .forEach(n => {
            if(n != e.target.closest(".dropdown")) {
              n.classList.remove("active")
            }
          });
      }
    });

    // fetch language file
    lang.fetchDict();

    // get apiKey from the logged in user
    storage.get("apiKey").then(apiKey => {
      if (router.isOutside() || apiKey) {
        router.sync();
      } else {
        // redirect to login if we don't have an apiKey
        //  log this so that we can later remove a falsy behavior
        //  We don't want to logout the user if the network is slow
        console.warn("No API key");
        router.navigate("/login");
      }
    });

    this.state = {
      action: router?.action,
      route: router?.route,
      id: router?.id,
      entityUrl: router?.entityUrl
    };
  }

  onRouterStateChange() {
    this.setState({
      action: router?.action,
      route: router?.route,
      id: router?.id,
      entityUrl: router?.entityUrl
    });
    setTimeout(() => window.scrollTo(0, 0));
    storage.get("apiKey").then(apiKey => {
      me.fetch().then(user => {
        if (apiKey && router.route != "login") {
          if (!user["id"] && !router.isOutside()) {
            storage.set("apiKey", "").then(() => router.navigate("/login"));
          } else {
            this.setState({
              route: router?.route,
              action: router?.action,
              id: router?.id,
              entityUrl: router?.entityUrl
            });
          }
        } else if (!router.isOutside()) {
            router.navigate("/login");
        }
      });
    });
    alert.add(lang.t(router.getParam("alert", router.search)));
  }

  render() {
    // external pages for non connected users
    switch (this.state.route) {
      case "signup":
        return (
            <Signup />
        );
      case "stop-notification-emails":
        return (
            <StopNotificationEmails />
        );
      case "public":
        return <Public token={this.state.id} key={this.state.id} />;
      case "password-reset":
        return (
            <ResetPassword />
        );
      case "login":
        return (
            <Login />
        );
    }

    return (
      <main>
        <Navbar />
        <div class="content">
          <MainContent {...this.state} />
        </div>
      </main>
    );
  }
}
