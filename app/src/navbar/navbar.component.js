import { h, Component } from "preact";
import { lang, router, util } from "/core";
import { FaIcon } from "/misc";
import { Search } from "/pages";
import { GroupsDropdownNavbar, NotificationsDropdownNavbar } from "/navbar";
import { Link, withRouter } from "react-router-dom";
import { connectStoreon } from 'storeon/preact'

class Navbar extends Component {

  // TODO
  //clickBackButton(evt) {
  //  evt.preventDefault();
  //  if (router.backUrlPrompt && !confirm(router.backUrlPrompt)) {
  //    return false;
  //  }
  //  router.onClick(evt);
  //}

  // TODO remove dispatch
  //const { dispatch, me, backUrl } = useStoreon('me', 'backUrl');
  //if (!me) {
  //  return null;
  //}

  componentDidMount() {
    router.getBackUrl().then(backUrl => {
      this.setState({backUrl});
    });
  }

  render() {
    return (
      <div class="main-nav nav align-items-center z-index-100">
        <div class="navbar-block">
          {(["share"].includes(router.route) ||
            ["settings"].includes(router.action) ||
            !this.state.backUrl) && (
              <div
                class="menu dropdown cursor-pointer"
                tabindex="-1"
                onClick={e => e.currentTarget.classList.toggle("active")}
              >
                <div class="rounded-circle avatar unselectable">
                  <img
                    class="rounded-circle"
                    style={util.backgroundHash(this.props.me.id)}
                    src={
                      this.props.me.avatar
                        ? util.crop(this.props.me.avatar["id"], 80, 80)
                        : util.defaultAvatar
                    }
                    onError={e => (e.currentTarget.src = util.defaultAvatar)}
                  />
                </div>
                <div class="dropdown-menu dropdown-right">
                  { this.props.me.data?.bookmarks?.length && (
                    <Link
                      class="d-block seamless-link capitalize"
                      to={"/bookmarks"}
                    >
                      {lang.t('bookmarks')}
                    </Link>
                  )}
                  <Link
                    class="d-block seamless-link capitalize"
                    to={`/users/${this.props.me.id}/settings`}
                  >
                    {lang.t("settings")}
                  </Link>
                  <Link
                    class="d-block seamless-link capitalize"
                    to={"/logout"}
                  >
                    {lang.t("logout")}
                  </Link>
                </div>
              </div>
            )}
          {["groups", "messages"].includes(router.route) && this.state.backUrl && (
            <Link
              class="seamless-link back"
              to={this.state.backUrl}
            >
              <FaIcon family={"solid"} icon={"arrow-left"} />
            </Link>
          )}
          <NotificationsDropdownNavbar />
        </div>
        <Search />
        <div class="navbar-block">
          <GroupsDropdownNavbar groups={this.props.me.groups} />
        </div>
      </div>
    );
  }
}

export default connectStoreon('me', withRouter(Navbar));
