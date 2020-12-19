import { h, Fragment } from "preact";
import { lang } from "/core";
import { FaIcon } from "/misc";
import { Link } from "react-router-dom";

export default function GroupsDropdownNavbar() {
  return (
    <Fragment>
      {this.props.groups && (
        <div
          class="nav-link dropdown groups unselectable"
          tabindex="-1"
          onClick={e => e.currentTarget.classList.toggle("active")}
        >
          <div class="unselectable pr-1">
            {lang.t("groups")} <FaIcon family={"solid"} icon={"caret-down"} />
          </div>
          <div class="dropdown-menu dropdown-left">
            {this.props.groups.map(e => (
              <Link
                to={`/groups/${e.id}`}
                class="d-block seamless-link unselectable"
              >
                {e.name}
              </Link>
            ))}
            <Link
              to={"/create-group"}
              class="seamless-link unselectable"
            >
              {`+ ${lang.t("create_a_group")}`}
            </Link>
          </div>
        </div>
      )}
    </Fragment>
  );
}
