import http from "./http.js";
import store from "/store";

const cache = {
  get(url) {
    return store?.get()[url];
  },

  update(url) {
    return http.get(url, true).then(r => {
      store.dispatch('entity/update', {url, entity: r});
      return r;
    });
  },

  fetch(url) {
    if (store.get()[url]?.id) {
      return new Promise(r => r(store.get()[url]));
    }
    return cache.update(url);
  },

};

export default cache;
