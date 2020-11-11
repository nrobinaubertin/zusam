import { h, Component } from "preact";
import { lang, http, me } from "/core";
import { FaIcon } from "/misc";
import { Notification } from "/pages";

export default class NotificationsDropdownNavbar extends Component {
  constructor(props) {
    super(props);
    this.clearAllNotifications = this.clearAllNotifications.bind(this);
  }

  clearAllNotifications() {
    if (me.notifications.length) {
      Promise.all(
        me.notifications.map(n => http.delete(`/api/notifications/${n.id}`))
      ).then(me.update());
    }
  }

  render() {
    return (
      <div
        className={
          `menu dropdown${me.me.notifications && me.me.notifications.length ? " cursor-pointer" : ""}`
        }
        title={lang.t('notifications')}
        tabindex="-1"
        onClick={e =>
          me.notifications.length &&
          e.currentTarget.classList.toggle("active")
        }
      >
        <div class="unselectable button-with-count">
          <FaIcon
            family={me.notifications.length ? "solid" : "regular"}
            icon={"bell"}
          />
          {!!me.notifications.length && (
            <span class="badge-count">{me.notifications.length}</span>
          )}
        </div>
        <div class="dropdown-menu dropdown-right notifications-menu">
          <div class="notification-header">
            <strong class="capitalize">{lang.t("notifications")}</strong>
            <div
              class="action capitalize"
              onClick={() => this.clearAllNotifications()}
            >
              {lang.t("mark_all_as_read")}
            </div>
          </div>
          {me.notifications?.length && (
            me.notifications.sort((a, b) => b.createdAt - a.createdAt).map(e => <Notification key={e.id} {...e} />)
          )}
        </div>
      </div>
    );
  }
}
