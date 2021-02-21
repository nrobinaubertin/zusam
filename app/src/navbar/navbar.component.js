import { h, Component } from "preact";
import { lang, router, util, me } from "/core";
import { FaIcon } from "/misc";
import { Search } from "/pages";
import { GroupsDropdownNavbar, NotificationsDropdownNavbar } from "/navbar";

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.clickBackButton = this.clickBackButton.bind(this);
  }

  clickBackButton(evt) {
    evt.preventDefault();
    if (router.backUrlPrompt && !confirm(router.backUrlPrompt)) {
      return false;
    }
    router.onClick(evt);
  }

  render() {
    return (
      <div class="main-nav nav align-items-center z-index-100">
        <div class="navbar-block">
          {(["share"].includes(router.route) ||
            ["settings"].includes(router.action) ||
            !router.backUrl) && (
              <div
                class="menu dropdown cursor-pointer"
                tabindex="-1"
                onClick={e => e.currentTarget.classList.toggle("active")}
              >
                <div class="rounded-circle avatar unselectable">
                  <img
                    class="rounded-circle"
                    style={util.backgroundHash(me.id)}
                    src={
                      me.avatar
                        ? util.crop(me.avatar["id"], 80, 80)
                        : util.defaultAvatar
                    }
                    onError={e => (e.currentTarget.src = util.defaultAvatar)}
                  />
                </div>
                <div class="dropdown-menu dropdown-right">
                  { me.me && me.me.data && Array.isArray(me.me.data.bookmarks) && me.me.data.bookmarks.length && (
                    <a
                      class="d-block seamless-link capitalize"
                      href={util.toApp("/bookmarks")}
                      onClick={e => router.onClick(e)}
                    >
                      {lang.t('bookmarks')}
                    </a>
                  )}
                  <a
                    class="d-block seamless-link capitalize"
                    href={util.toApp(`/users/${me.id}/settings`)}
                    onClick={e => router.onClick(e)}
                  >
                    {lang.t("settings")}
                  </a>
                  <a
                    class="d-block seamless-link capitalize"
                    href={util.toApp("/logout")}
                    onClick={e => router.onClick(e)}
                  >
                    {lang.t("logout")}
                  </a>
                </div>
              </div>
            )}
          {["groups", "messages"].includes(router.route) && router.backUrl && (
            <a
              class="seamless-link back"
              href={util.toApp(router.backUrl)}
              onClick={e => this.clickBackButton(e)}
            >
              <FaIcon family={"regular"} icon={"level-down-alt"} rotation={"180deg"} />
            </a>
          )}
          <NotificationsDropdownNavbar />
        </div>
        <Search />
        <div class="navbar-block">
          <GroupsDropdownNavbar />
        </div>
      </div>
    );
  }
}
