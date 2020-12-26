import { http, util, lang, storage, me } from "/core";

const removeSubpath = path => path ? path.replace(new RegExp(`^${util.getSubpath()}`), "") : "";

const isEntity = name => ["messages", "groups", "users", "links", "files"].includes(name);

const getUrlComponents = url => {
  let components = {};
  if (url) {
    components.url = new URL(url);
    components.path = components.url.pathname;
    components.search = components.url.search.slice(1);
    [
      components.route,
      components.id,
      components.action
    ] = removeSubpath(components.path).slice(1).split("/");
  }
  components.entityUrl = "";
  components.entityType = "";
  components.backUrl = "";
  components.backUrlPrompt = "";
  return components;
};

export const routerStore = store => {
  store.on('@init', () => ({
    route: "",
    id: "",
    action: "",
    backUrl: "",
    backUrlPrompt: "",
    entityUrl: "",
    entityType: "",
    search: "",
    entity: {},
  }))

  store.on('router/update', (state, newState) => {
    return {
      entity: newState.entity,
      backUrl: newState.backUrl,
      backUrlPrompt: newState.backUrlPrompt,
    };
  })

  store.on('router/recalculate', (state, url = "/") => {
    console.log("recalculate");
    if (!url.match(/^http/)) {
      url = util.toApp(url);
    }

    //let newState = Object.assign(state, getUrlComponents(url));
    let newState = getUrlComponents(url);

    // set url, backUrl and entityUrl
    storage.get("apiKey").then(apiKey => {
      if (apiKey && newState.id && isEntity(newState?.route)) {
        newState.entityUrl = `/api/${newState.route}/${newState.id}`;
        newState.entityType = newState.route;

        http.get(newState.entityUrl).then(res => {
            if (!res) {
              console.warn("Unknown entity");
              // TODO: what should we do here ?
              //newState.navigate(); // could go into navigate loop if disconnected
              return;
            }
            newState.entity = res;
            switch (newState.route) {
              case "groups":
                if (newState.action == "write") {
                  newState.backUrl = `/${newState.route}/${newState.id}`;
                  newState.backUrlPrompt = lang.t("cancel_write");
                }
                if (location.search) {
                  newState.backUrl = `/${newState.route}/${newState.id}`;
                }
                break;
              case "messages":
                if (res["parent"] && !res["isInFront"]) {
                  newState.backUrl = `/messages/${res["parent"].id}`;
                } else {
                  newState.backUrl = `/groups/${util.getId(res.group)}`;
                }
                break;
              case "users":
                newState.backUrl = "/";
                break;
              default:
                if (newState.action) {
                  newState.backUrl = "/";
                }
            }
            store.dispatch('router/update', newState);
          }).catch(e => console.warn(e));
      } else {
        newState.entity = null;
        store.dispatch('router/update', newState);
      }
    });
  })
}
