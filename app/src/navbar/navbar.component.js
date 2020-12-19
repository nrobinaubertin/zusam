import { h } from "preact";
import { lang, router, util } from "/core";
import { FaIcon } from "/misc";
import { Search } from "/pages";
import { GroupsDropdownNavbar, NotificationsDropdownNavbar } from "/navbar";
import { Link } from "react-router-dom";
import { useStoreon } from 'storeon/preact'

export default function Navbar() {

  //function clickBackButton(evt) {
  //  evt.preventDefault();
  //  if (router.backUrlPrompt && !confirm(router.backUrlPrompt)) {
  //    return false;
  //  }
  //  router.onClick(evt);
  //}

  const { dispatch, me } = useStoreon('me');
  if (!me) {
    return null;
  }

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
                { me.data?.bookmarks?.length && (
                  <Link
                    class="d-block seamless-link capitalize"
                    to={"/bookmarks"}
                  >
                    {lang.t('bookmarks')}
                  </Link>
                )}
                <Link
                  class="d-block seamless-link capitalize"
                  to={`/users/${me.id}/settings`}
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
        {["groups", "messages"].includes(router.route) && router.backUrl && (
          <Link
            class="seamless-link back"
            to={router.backUrl}
          >
            <FaIcon family={"solid"} icon={"arrow-left"} />
          </Link>
        )}
        <NotificationsDropdownNavbar />
      </div>
      <Search />
      <div class="navbar-block">
        <GroupsDropdownNavbar groups={me.groups} />
      </div>
    </div>
  );
}
