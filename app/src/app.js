import { h, Component } from "preact";
import { http, storage, router, api, me } from "/core";
import {
  Login,
  Public,
  ResetPassword,
  Signup,
  StopNotificationEmails
} from "/outside";
import { MessageParent } from "/message";
import { Home, CreateGroup, GroupTitle, GroupBoard, Share, BookmarkBoard } from "/pages";
import { Settings } from "/settings";
import { Navbar, GroupSearch } from "/navbar";
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

    // update me
    me.update();

    // i18n dict management
    window.addEventListener("fetchedNewDict", () => {
      setTimeout(() => this.setState({lang: "up"}), 10);
    });

    // manage dropdowns
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

    // check if user is connected
    storage.get("apiKey").then(apiKey => {
      if (router.route == "invitation") {
          if (apiKey) {
            http.post(`/api/groups/invitation/${router.id}`, {}).then(() => {
              this.props.history.push("/");
            });
          } else {
            this.props.history.push(`/signup?inviteKey=${router.id}`);
          }
      } else if (!router.isOutside() && !apiKey) {
        // redirect to login if we don't have an apiKey
        this.props.history.push("/login");
      }
    });
  }

  render() {

    return (
      <Router>
        <Switch>

          <Route path="/" exact={true} render={() => (
              <Home />
          )} />

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
