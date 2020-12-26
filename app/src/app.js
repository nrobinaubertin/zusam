import { h, Component } from "preact";
import { http, util, storage, router, api, me } from "/core";
import {
  Login,
  Public,
  ResetPassword,
  Signup,
  StopNotificationEmails
} from "/outside";
import { MessageParent } from "/message";
import { CreateGroup, GroupTitle, GroupBoard, Share, BookmarkBoard } from "/pages";
import { Settings } from "/settings";
import { Navbar, GroupSearch } from "/navbar";
import { FaIcon } from "/misc";
import Writer from "/message/writer.component.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";

class App extends Component {
  constructor(props) {
    super(props);

    // load api infos
    api.update();

    //window.addEventListener('popstate', console.log);
    //window.addEventListener("navigate", router.recalculate);

    //this.onRouterStateChange = this.onRouterStateChange.bind(this);
    //window.addEventListener("routerStateChange", this.onRouterStateChange);

    window.addEventListener("fetchedNewDict", () => {
      setTimeout(() => this.setState({lang: "up"}), 10);
    });

    //window.addEventListener("popstate", router.sync);
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

    router.recalculate();

    if (router.route == "invitation") {
      storage.get("apiKey").then(apiKey => {
        if (apiKey) {
          http.post(`/api/groups/invitation/${router.id}`, {}).then(() => {
            window.location.href = window.location.origin;
          });
        } else {
          this.props.history.push(`/signup?inviteKey=${router.id}`);
        }
      });
    } else {
      storage.get("apiKey").then(apiKey => {
        if (router.isOutside() || apiKey) {
          router.sync();
        } else {
          // redirect to login if we don't have an apiKey
          this.props.history.push("/login");
        }
      });
    }
  }

  //componentDidUpdate(prevProps) {
  //  console.log("UPDATE");
  //  if (this.props.location !== prevProps.location) {
  //    console.log("route change detected");
  //    router.recalculate(this.props.location.pathname);
  //  }
  //}

  componentDidMount() {
    //console.log(this.props.history);
    //this.props.history.listen((location, action) => {
    //  // location is an object like window.location
    //  console.log(action, location.pathname, location.state)
    //  console.log("DETECTED");
    //  router.recalculate();
    //});

    me.fetch().then(user => {

      if (!user) {
        this.props.history.push("/login");
        return;
      }

      if (router.route == "" || router.route == "/") {
        if (user.data?.default_group) {
          this.props.history.push(`/groups/${user?.data["default_group"]}`);
        } else if (user?.groups[0]) {
          this.props.history.push(`/groups/${user?.groups[0].id}`);
        } else {
          window.location = "/create-group";
        }
      }
    });
  }

  componentWillUmount() {
    console.log("APPJS unmount");
  }

  render() {
    //if (router.route == "" || router.route == "/") {
    //  me.fetch().then(user => {
    //    console.log(user);
    //    if (!user) {
    //      router.navigate("/login");
    //      return;
    //    }
    //    if (user.data?.default_group) {
    //      router.navigate(`/groups/${user?.data["default_group"]}`);
    //    } else if (user?.groups[0]) {
    //      router.navigate(`/groups/${user?.groups[0].id}`);
    //    } else {
    //      window.location = "/create-group";
    //    }
    //  });
    //}

    return (
      <Router>
        <Switch>

          <Route path="/signup" render={() => (
            <Signup />
          )} />

          <Route path="/stop-notification-emails" render={() => (
            <StopNotificationEmails />
          )} />

          <Route path="/public/:token" render={props => (
            <Public token={props.match.params.token} key={props.match.params.token} />
          )} />

          <Route path="/reset-password" render={() => (
            <ResetPassword />
          )} />

          <Route path="/login" render={() => (
            <Login />
          )} />

          <Route path="/:type/:id/settings" render={props => (
            <Settings
              type={props.match.params.type}
              id={props.match.params.id}
              key={props.match.params.id}
            />
          )} />

          <Route path="/create-group" render={() => (
            <main>
              <Navbar />
              <div class="content">
                <CreateGroup />;
              </div>
            </main>
          )} />

          <Route path="/share" render={() => (
            <main>
              <Navbar />
              <div class="content">
                <Share />;
              </div>
            </main>
          )} />

          <Route path="/messages/:id" render={props => (
            <MessageParent key={props.match.params.id} id={props.match.params.id} isPublic={false} />
          )} />

          <Route path="/bookmarks" render={() => (
            <main>
              <Navbar />
              <div class="content">
                <div>
                  <BookmarkBoard />
                </div>
              </div>
            </main>
          )} />

          <Route path="/groups/:id" render={props => {

            if (
              router.getParam("search", props.location.search.substring(1))
              || router.getParam("hashtags", props.location.search.substring(1))
            ) {
              return (
                <main>
                  <Navbar />
                  <div class="content">
                    <article class="mb-3">
                      <div class="container pb-3">
                        <GroupTitle />
                        <GroupSearch key={props.match.params.id} id={props.match.params.id} />
                      </div>
                    </article>
                  </div>
                </main>
              );
            }

            return <GroupBoard key={props.match.params.id} id={props.match.params.id} />
          }} />

          <Route path="/groups/:id/write" render={props => (
            <main>
              <Navbar />
              <div class="content">
                <article class="mb-3">
                  <div class="container pb-3">
                    <GroupTitle />
                    <Writer focus={true} group={props.match.params.id} />
                  </div>
                </article>
              </div>
            </main>
          )} />

        </Switch>
      </Router>
    );
  }
}

export default withRouter(App);
