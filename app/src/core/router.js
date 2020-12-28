import util from "./util.js";
import storage from "./storage.js";
import http from "./http.js";
import store from "/store";

const router = {

  get() {
    return store.get();
  },

  get route() {
    //return store?.get()?.route;
    try {
      return router.removeSubpath(location.pathname).slice(1).split("/")[0];
    } catch {
      return "";
    }
  },

  get id() {
    //return store?.get()?.id;
    try {
      return router.removeSubpath(location.pathname).slice(1).split("/")[1];
    } catch {
      return "";
    }
  },

  get action() {
    //return store?.get()?.action;
    try {
      return router.removeSubpath(location.pathname).slice(1).split("/")[2];
    } catch {
      return "";
    }
  },

  get backUrl() {
    console.warn("don't use backUrl");
    return store.get()?.backUrl;
  },

  get backUrlPrompt() {
    console.warn("don't use backUrlPrompt");
    return store.get()?.backUrlPrompt;
  },

  get entityUrl() {
    //return store?.get()?.entityUrl;
    try {
      return `/api/${router.removeSubpath(location.pathname).slice(1).split("/").slice(0,2).join("/")}`;
    } catch {
      return "";
    }
  },

  get entityType() {
    console.warn("don't use entityType");
    return store.get()?.entityType;
  },

  get search() {
    //return store?.get()?.search;
    return location.search.slice(1);
  },

  getBackUrl() {
    return router.getEntity().then(entity => {
      switch (router.route) {
        case "groups":
          if (router.action == "write") {
            return `/${router.route}/${router.id}`;
          }
          if (location.search) {
            return `/${router.route}/${router.id}`;
          }
          return "";
        case "messages":
          if (entity["parent"] && !entity["isInFront"]) {
            return `/messages/${entity["parent"].id}`;
          }
          return `/groups/${util.getId(entity.group)}`;
        case "users":
          return "/";
        default:
          if (router.action) {
            return "/";
          }
          return "";
      }
    });
  },

  getEntity() {
    const newState = router.getUrlComponents(util.toApp(location.pathname));
    return storage.get("apiKey").then(apiKey => {
      if (apiKey && newState.id && router.isEntity(newState?.route)) {
        return http.get(`/api/${newState.route}/${newState.id}`).then(res => {
          if (!res) {
            console.warn("Unknown entity");
            // TODO: what should we do here ?
            return null;
          }
          return res;
        });
      }
      return null;
    });
  },

  get entity() {
    console.warn("don't use entity");
    return store.get()?.entity;
  },

  removeSubpath: path =>
    path ? path.replace(new RegExp(`^${util.getSubpath()}`), "") : "",

  getParam: (param, searchParams = window.location.search.substring(1)) => {
    let res = searchParams.split("&").find(e => e.split("=")[0] === param);
    return res ? decodeURIComponent(res.split("=")[1]) : "";
  },

  getSegments: () =>
      router
      .removeSubpath(window.location.pathname)
      .slice(1)
      .split("?")[0]
      .split("/"),

  // check if route is "outside": accessible to non connected user
  isOutside: () =>
    [
      "login",
      "password-reset",
      "signup",
      "invitation",
      "stop-notification-emails",
      "public"
    ].includes(router.route || router.getSegments()[0]),

  isEntity: () => ["messages", "groups", "users", "links", "files"].includes(router.getSegments()[0]),

  getUrlComponents: url => {
    let components = {};
    if (url) {
      components.url = new URL(url);
      components.path = components.url.pathname;
      components.search = components.url.search.slice(1);
      [components.route, components.id, components.action] = router
        .removeSubpath(components.path)
        .slice(1)
        .split("/");
    }
    components.entityUrl = "";
    components.entityType = "";
    components.backUrl = "";
    components.backUrlPrompt = "";
    return components;
  },

  navigate: async (url = "/", options = {replace: false}) => {
    console.warn("FORCE NAVIGATE");
    if (!url.match(/^http/) && !options["raw_url"]) {
      url = util.toApp(url);
    }

    window.dispatchEvent(new CustomEvent("navigate", {detail:{url}}));
    //if (options.replace) {
    //  history.replaceState(null, "", url);
    //} else {
    //  history.pushState(null, "", url);
    //}
  },

  recalculate: path => {
    store.dispatch('router/recalculate', path);
  },

  //sync: () => {
  //  router.navigate(location.pathname + location.search + location.hash, {
  //    replace: true
  //  });
  //},

  onClick: (e, newTab = false, url = null) => {
    // stop propagation
    e.preventDefault();
    e.stopPropagation();

    // if url is not given, try to guess it
    if (!url) {
      const t = e.target.closest("a");
      if (t) {
        if (t.target == "_blank") {
          newTab = true;
        }
        url = t.getAttribute("href");
      }
    }

    if (!url) {
      return;
    }

    // check if it's an external url
    // FIXME TODO
    //if (url.startsWith("http")) {
    //  let targetUrl = new URL(url);
    //  if (targetUrl.host != location.host) {
    //    if (e.ctrlKey || newTab) {
    //      open(url, "_blank");
    //    } else {
    //      location.href = url;
    //    }
    //    return;
    //  }
    //}

    // disable active stances (dropdowns...)
    for (let e of document.getElementsByClassName("active")) {
      e.classList.remove("active");
    }

    // go to target url
    if (e.ctrlKey || newTab) {
      open(url, "_blank");
    } else {
      router.navigate(url);
    }
  },

  logout: () => {
    storage.reset();
    window.location.href = window.location.origin;
  }
};
export default router;
