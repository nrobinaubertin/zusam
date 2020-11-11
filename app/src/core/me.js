import http from "./http.js";
import lang from "./lang.js";
import alert from "./alert.js";
import util from "./util.js";
import router from "./router.js";
import store from "/store";

const me = {

  get() {
    return store?.get();
  },

  get data() {
    return store?.get()?.data;
  },

  get groups() {
    return store?.get()?.groups;
  },

  get id() {
    return store?.get()?.id;
  },

  get avatar() {
    return store?.get()?.avatar;
  },

  get notifications() {
    return store?.get()?.notifications || [];
  },

  getGroupId() {
    if (store.get()["groups"]) {
      switch (router.entity.entityType) {
        case "group":
          return util.getId(router.entity);
        case "message":
          return util.getId(router.entity.group);
      }
    }
    return "";
  },

  getGroupName() {
    let group = store.get()["groups"]?.find(g => g["id"] == me.getGroupId());
    return group ? group["name"] : "";
  },

  update() {
    return http.get("/api/me", true).then(r => {
      if (!r) {
        store.dispatch('update', {});
      }
      store.dispatch('me/update', Object.assign({loaded: true}, r));
      http.get(`/api/users/${store.get()["id"]}/notifications`).then(r => {
        store.dispatch('me/update', {notifications: r, loaded:true});
      }),
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
    let state = store.get();
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
