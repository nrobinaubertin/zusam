import http from "./http.js";
import lang from "./lang.js";
import alert from "./alert.js";

const me = {
  me: {},
  get: () => (me.me.id ? Promise.resolve(me.me) : me.update()),
  update: () =>
    http.get("/api/me", true).then(r => {
      if (!r) {
        return;
      }
      me.me = Object.assign({ notifications: [] }, r);
      me.loadNotifications();
      lang.fetchDict();
      setTimeout(dispatchEvent(new CustomEvent("meStateChange")));
      return r;
    }),
  loadNotifications: () =>
    http.get(`/api/users/${me.me.id}/notifications`).then(r => {
      me.me.notifications = r;
      setTimeout(dispatchEvent(new CustomEvent("meStateChange")));
    }),
  matchNotification: (notif, id) => {
    if (notif.id === id) {
      return true;
    }
    if (notif.target === id) {
      return true;
    }
    return false;
  },
  isNew: id =>
    Array.isArray(me.me.notifications)
      ? me.me.notifications.some(
          n =>
            me.matchNotification(n, id) ||
            (n.type == "new_comment" && n.fromMessage.id === id)
        )
      : false,
  removeMatchingNotifications: id => {
    return me.loadNotifications().then(() => {
      if (!Array.isArray(me.me.notifications)) {
        return Promise.reject("Failed to get notifications from server");
      }
      return Promise.all(
        me.me.notifications
          .filter(n => me.matchNotification(n, id))
          .map(n =>
            http.delete(`/api/notifications/${n.id}`).then(() => {
              me.me.notifications = me.me.notifications.filter(
                e => !me.matchNotification(e, id)
              );
              setTimeout(dispatchEvent(new CustomEvent("meStateChange")));
            })
          )
      );
    });
  },
  hasBookmark: id => {
    if (me.me && me.me.data && Array.isArray(me.me.data.bookmarks)) {
      return me.me.data.bookmarks.some(bid => bid === id);
    }
    return false;
  },
  addBookmark: id => {
    if (!me.hasBookmark(id)) {
      http.post(`/api/bookmarks/${id}`).then(user => {
        me.me = Object.assign(me.me, user);
        setTimeout(dispatchEvent(new CustomEvent("meStateChange")));
        alert.add(lang.t("bookmark_added"));
      });
    }
  },
  removeBookmark: id => {
    if (me.hasBookmark(id)) {
      http.delete(`/api/bookmarks/${id}`).then(user => {
        me.me = Object.assign(me.me, user);
        setTimeout(dispatchEvent(new CustomEvent("meStateChange")));
        alert.add(lang.t("bookmark_removed"));
      });
    }
  },
};
export default me;
