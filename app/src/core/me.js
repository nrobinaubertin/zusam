import http from "./http.js";
import lang from "./lang.js";
import store from "/store";

const me = {

  get() {
    return store.get()?.me;
  },

  get data() {
    return store.get()?.me?.data;
  },

  get groups() {
    return store.get()?.me?.groups;
  },

  get id() {
    return store.get()?.me?.id;
  },

  get avatar() {
    return store.get()?.me?.avatar;
  },

  get notifications() {
    return store.get()?.notifications || [];
  },

  getGroupName(id) {
    let group = store.get()["groups"]?.find(g => g["id"] == id);
    return group ? group["name"] : "";
  },

  update() {
    return http.get("/api/me", true).then(r => {
      if (!r || !r?.id) {
        store.dispatch('update', {});
        return;
      }
      store.dispatch('me/update', Object.assign({loaded: true}, r));
      http.get(`/api/users/${store.get()?.me?.id}/notifications`).then(r => {
        store.dispatch('notifications/update', r);
      });
      lang.fetchDict();
      return r;
    });
  },

  fetch() {
    if (store.get()["loaded"]) {
      return new Promise(r => r(store.get()));
    }
    return me.update();
  },

  isNew(id) {
    let state = store.get();
    if (Array.isArray(state.notifications)) {
      return state.notifications.some(
        n =>
          me.matchNotification(n, id) ||
          (n.type == "new_comment" && n.fromMessage.id === id)
      );
    }
    return false;
  },

  hasBookmark(id) {
    let state = store.get()?.me;
    if (Array.isArray(state?.data?.bookmarks)) {
      return state.data.bookmarks.some(bid => bid === id);
    }
    return false;
  },

  removeBookmark(id) {
    store.dispatch('bookmark/remove', id);
  },

  addBookmark(id) {
    store.dispatch('bookmark/add', id);
  },

  removeAllNotifications() {
    let state = store.get();
    state.notifications
      .map(n => store.dispatch('notification/remove', n))
  },

  removeMatchingNotifications(id) {
    let state = store.get();
    state.notifications
      .filter(n => me.matchNotification(n, id))
      .map(n => store.dispatch('notification/remove', n))
  },

  matchNotification(notif, id) {
    if (notif.id === id) {
      return true;
    }
    if (notif.target === id) {
      return true;
    }
    return false;
  }
}

export default me;
