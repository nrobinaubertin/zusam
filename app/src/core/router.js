import http from "./http.js";
import me from "./me.js";
import util from "./util.js";
import lang from "./lang.js";
import storage from "./storage.js";

const router = {
  route: "",
  id: "",
  action: "",
  backUrl: "",
  backUrlPrompt: "",
  entityUrl: "",
  entityType: "",
  search: "",
  entity: {},
  isValidUrl: url => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  },
  getSubpath: () => new URL(document.baseURI).pathname.replace(/\/$/, ""),
  toApp: url => {
    if (!url || typeof url != "string") {
      return "";
    }
    if (router.isValidUrl(url)) {
      return url;
    }
    return location.origin + router.getSubpath() + router.removeSubpath(url);
  },
  removeSubpath: path =>
    path ? path.replace(new RegExp(`^${  router.getSubpath()}`), "") : "",
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
  isEntity: name =>
    ["messages", "groups", "users", "links", "files"].includes(name),
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
  navigate: async (url = "/", options = {}) => {
    if (!url.match(/^http/) && !options["raw_url"]) {
      url = router.toApp(url);
    }
    let components = router.getUrlComponents(url);
    // do not allow to renavigate to the same url. This is done to avoid accidental navigate locks
    if (router.url && router.url.href == components.url.href) {
      console.warn("navigate lock !");
      return;
    }
    Object.assign(router, components);

    // set url, backUrl and entityUrl
    if (router.id && router.isEntity(router.route)) {
      router.entityUrl = `/api/${router.route}/${router.id}`;
      router.entityType = router.route;

      await http
        .get(router.entityUrl)
        .then(res => {
          if (!res) {
            console.warn("Unknown entity");
            // TODO: what should we do here ?
            //router.navigate(); // could go into navigate loop if disconnected
            return;
          }
          router.entity = res;
          switch (router.route) {
            case "groups":
              if (router.action == "write") {
                router.backUrl = `/${router.route}/${router.id}`;
                router.backUrlPrompt = lang.t("cancel_write");
              }
              if (router.search) {
                router.backUrl = `/${router.route}/${router.id}`;
              }
              break;
            case "messages":
              if (res["parent"] && !res["isInFront"]) {
                router.backUrl = `/messages/${res["parent"].id}`;
              } else {
                router.backUrl = `/groups/${util.getId(res.group)}`;
              }
              break;
            case "users":
              router.backUrl = "/";
              break;
            default:
              if (router.action) {
                router.backUrl = "/";
              }
          }
        })
        .catch(e => console.warn(e));
    } else {
      router.entity = null;
    }

    switch (router.route) {
      case "login":
        storage.reset();
      case "bookmarks":
      case "create-group":
      case "groups":
      case "messages":
      case "password-reset":
      case "public":
      case "share":
      case "signup":
      case "stop-notification-emails":
      case "users":
        if (options.replace) {
          history.replaceState(null, "", url);
        } else {
          history.pushState(null, "", url);
        }
        window.dispatchEvent(new CustomEvent("routerStateChange"));
        break;
      case "logout":
        util.logout();
        break;
      case "invitation":
        storage.get("apiKey").then(apiKey => {
          if (apiKey) {
            http.post(`/api/groups/invitation/${  router.id}`, {}).then(() => {
              window.location.href = window.location.origin;
            });
          } else {
            router.navigate(`/signup?inviteKey=${  router.id}`);
          }
        });
        break;
      default:
        me.get().then(user => {
          if (!user) {
            router.navigate("/login");
            return;
          }
          if (user.data["default_group"]) {
            router.navigate(`/groups/${  user.data["default_group"]}`);
          } else if (user.groups[0]) {
              router.navigate(`/groups/${  user.groups[0].id}`);
            } else {
              window.location = "/create-group";
            }
        });
    }
  },
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
    if (url.startsWith("http")) {
      let targetUrl = new URL(url);
      if (targetUrl.host != location.host) {
        if (e.ctrlKey || newTab) {
          open(url, "_blank");
        } else {
          location.href = url;
        }
        return;
      }
    }

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
  }
};
export default router;
