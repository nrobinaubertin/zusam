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
} from "react-router-dom";

export default class App extends Component {
  constructor() {
    super();

    // load api infos
    api.update();

    window.addEventListener('popstate', () => router.recalculate());

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
          router.navigate(`/signup?inviteKey=${router.id}`);
        }
      });
    } else {
      storage.get("apiKey").then(apiKey => {
        if (router.isOutside() || apiKey) {
          router.sync();
        } else {
          // redirect to login if we don't have an apiKey
          router.navigate("/login");
        }
      });
    }
  }

  componentDidMount() {
    me.fetch().then(user => {

      if (!user) {
        router.navigate("/login");
        return;
      }

      if (router.route == "" || router.route == "/") {
        if (user.data?.default_group) {
          router.navigate(`/groups/${user?.data["default_group"]}`);
        } else if (user?.groups[0]) {
          router.navigate(`/groups/${user?.groups[0].id}`);
        } else {
          window.location = "/create-group";
        }
      }
    });
  }

  render() {
    //if (router.getParam("search") || router.getParam("hashtags")) {
    //  return (
    //    <div>
    //      <GroupSearch key={router.id} id={router.id} />
    //    </div>
    //  );
    //}

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
          <Route path="/signup">
            <Signup />
          </Route>

          <Route path="/stop-notification-emails">
            <StopNotificationEmails />
          </Route>

          <Route path="/public">
            <Public token={router.id} key={router.id} />;
          </Route>

          <Route path="/reset-password">
            <ResetPassword />
          </Route>

          <Route path="/login">
            <Login />
          </Route>

          <Route path="/users/:id/settings">
            <Settings key={router.entityUrl} entityUrl={router.entityUrl} />
          </Route>

          <Route path="/groups/:id/settings">
            <Settings key={router.entityUrl} entityUrl={router.entityUrl} />
          </Route>

          <Route path="/create-group">
            <main>
              <Navbar />
              <div class="content">
                <CreateGroup />;
              </div>
            </main>
          </Route>

          <Route path="/share">
            <main>
              <Navbar />
              <div class="content">
                <Share />;
              </div>
            </main>
          </Route>

          <Route path="/messages/:id" component={MessageParent} />

          <Route path="/bookmarks">
            <main>
              <Navbar />
              <div class="content">
                <div>
                  <BookmarkBoard />
                </div>
              </div>
            </main>
          </Route>

          <Route path="/groups/:id" component={GroupBoard} />

          <Route path="/groups/:id/write">
            {params => (
              <main>
                <Navbar />
                <div class="content">
                  <article class="mb-3">
                    <div class="container pb-3">
                      <GroupTitle
                        key={params.id}
                        id={params.id}
                        name={me.getGroupName(params.id)}
                      />
                      <Writer focus={true} group={params.id} />
                    </div>
                  </article>
                </div>
              </main>
            )}
          </Route>
        </Switch>
      </Router>
    );
  }
}
