import { h, Fragment } from "preact";
import { lang, router, util, me } from "/core";
import { FaIcon } from "/misc";

export default function GroupsDropdownNavbar() {
  return (
    <Fragment>
      {me.groups && (
        <div
          class="nav-link dropdown groups unselectable"
          tabindex="-1"
          onClick={e => e.currentTarget.classList.toggle("active")}
        >
          <div class="unselectable pr-1">
            {lang.t("groups")} <FaIcon family={"solid"} icon={"caret-down"} />
          </div>
          <div class="dropdown-menu dropdown-left">
            {me.groups.map(e => (
              <a
                class="d-block seamless-link unselectable"
                href={util.toApp(`/groups/${e.id}`)}
                onClick={e => router.onClick(e)}
              >
                {e.name}
              </a>
            ))}
            <a
              class="seamless-link unselectable"
              href={util.toApp("/create-group")}
              onClick={e => router.onClick(e)}
            >
              {`+ ${lang.t("create_a_group")}`}
            </a>
          </div>
        </div>
      )}
    </Fragment>
  );
}
