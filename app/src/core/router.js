import cache from "./cache.js";
import http from "./http.js";
import me from "./me.js";
import nlg from "./nlg.js";
import util from "./util.js";
import lang from "./lang.js";

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
    getSubpath: () => (new URL(document.baseURI)).pathname.replace(/\/$/, ''),
    toApp: url => url ? location.origin + router.getSubpath() + url : "",
    removeSubpath: path => path ? path.replace(new RegExp('^' + router.getSubpath()), '') : "",
    getParam: (param, searchParams = window.location.search.substring(1)) => {
        let res = searchParams.split("&").find(e => e.split("=")[0] === param);
        return res ? res.split("=")[1] : "";
    },
    getSegments: () => window.location.pathname.slice(1).split("?")[0].split("/"),
    // check if route is "outside": accessible to non connected user
    isOutside: () => [
        "login",
        "password-reset",
        "signup",
        "invitation",
        "stop-notification-emails",
        "public",
    ].includes(router.route || router.getSegments()[0]),
    isEntity: name => [
        "messages",
        "groups",
        "users",
        "links",
        "files"
    ].includes(name),
    navigate: async (url, options = {}) => {
        if (!url.match(/^http/) && !options["raw_url"]) {
            url = router.toApp(url);
        }
        router.url = new URL(url);
        router.path = router.url.pathname;
        router.search = router.url.search.slice(1);
        [router.route, router.id, router.action] = router.removeSubpath(router.path).slice(1).split("/");
        router.entityUrl = "";
        router.entityType = "";
        router.backUrl = "";
        router.backUrlPrompt = "";

        // set url, backUrl and entityUrl
        if (router.route && router.id && router.isEntity(router.route)) {
            router.entityUrl = "/api/" + router.route + "/" + router.id;
            router.entityType = router.route;

            await cache.get(router.entityUrl).then(res => {
                router.entity = res;
                switch(router.route) {
                    case "groups":
                        if (router.action == "write") {
                            router.backUrl = "/" + router.route + "/" + router.id;
                            router.backUrlPrompt = lang.t("cancel_write");
                        }
                        break;
                    case "messages":
                        if (res["parent"] && !res["isInFront"]) {
                            router.backUrl = "/messages/" + res["parent"].id;
                        } else {
                            router.backUrl = "/groups/" + util.getId(res.group);
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
            }).catch(e => console.warn(e));
        }

        switch (router.route) {
            case "password-reset":
            case "stop-notification-emails":
            case "signup":
            case "login":
            case "share":
            case "public":
            case "messages":
            case "groups":
            case "users":
            case "create-group":
                if (options.replace) {
                    history.replaceState(null, "", url);
                } else {
                    history.pushState(null, "", url);
                }
                window.dispatchEvent(new CustomEvent("routerStateChange"));
                break;
            case "logout":
                cache.reset();
                window.location.href = window.location.origin;
                break;
            case "invitation":
                cache.get("apiKey").then(apiKey => {
                    if (apiKey) {
                        http.post("/api/groups/invitation/" + router.id, {}).then(res => {
                            window.location.href = window.location.origin;
                        });
                    } else {
                        router.navigate("/signup?inviteKey=" + router.id);
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
                        router.navigate("/groups/" + user.data["default_group"]);
                    } else {
                        if (user.groups[0]) {
                            router.navigate("/groups/" + user.groups[0].id);
                        } else {
                            window.location = "/create-group";
                        }
                    }
                });
        }
    },
    sync: () => router.navigate(location.pathname + location.search + location.hash, {replace: true}),
    onClick: (e, newTab = false, url = null) => {
        // stop propagation
        e.preventDefault();
        e.stopPropagation();

        // if url is not given, try to guess it
        if (!url) {
            const t = e.target.closest("a");
            if (t) {
                if(t.target == "_blank") {
                    newTab = true;
                }
                url = t.getAttribute("href");
            }
        }

        if (!url) {
            return;
        }

        // check if it's an external url
        if (url.startsWith('http')) {
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
    },
};
export default router;
