import util from "./util.js";
import storage from "./storage.js";
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
      return `api/${router.removeSubpath(location.pathname).slice(1).split("/").slice(1).join("/")}`;
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
    console.log("navigate !");
    if (!url.match(/^http/) && !options["raw_url"]) {
      url = util.toApp(url);
    }

    console.log(url);
    window.dispatchEvent(new CustomEvent("navigate", {detail:{url}}));
    //if (options.replace) {
    //  history.replaceState(null, "", url);
    //} else {
    //  history.pushState(null, "", url);
    //}
  },

  recalculate: () => store.dispatch('router/recalculate'),

  sync: () => {
    router.navigate(location.pathname + location.search + location.hash, {
      replace: true
    });
  },

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
