import { h } from "preact";
import { lang, me } from "/core";
import { FaIcon } from "/misc";
import { Notification } from "/pages";
import { useStoreon } from 'storeon/preact'

export default function NotificationsDropdownNavbar() {

  // TODO remove dispatch
  const { dispatch, notifications } = useStoreon('notifications');
  if (!notifications) {
    return null;
  }

  return (
    <div
      className={
        `menu dropdown${notifications.length ? " cursor-pointer" : ""}`
      }
      title={lang.t('notifications')}
      tabindex="-1"
      onClick={e =>
        notifications.length &&
        e.currentTarget.classList.toggle("active")
      }
    >
      <div class="unselectable button-with-count">
        <FaIcon
          family={notifications.length ? "solid" : "regular"}
          icon={"bell"}
        />
        {!!notifications.length && (
          <span class="badge-count">{notifications.length}</span>
        )}
      </div>
      <div class="dropdown-menu dropdown-right notifications-menu">
        <div class="notification-header">
          <strong class="capitalize">{lang.t("notifications")}</strong>
          <div
            class="action capitalize"
            onClick={() => me.removeAllNotifications()}
          >
            {lang.t("mark_all_as_read")}
          </div>
        </div>
        {notifications?.length && (
          notifications.sort((a, b) => b.createdAt - a.createdAt).map(e => <Notification key={e.id} {...e} />)
        )}
      </div>
    </div>
  );
}
