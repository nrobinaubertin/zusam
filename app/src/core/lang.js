import http from "./http.js";
import me from "./me.js";

const lang = {
  dict: [], // dicts loaded for the current session
  possibleLang: {
    en: "English",
    es: "Español",
    fr: "Français",
    sk: "Slovenský"
  }, // possible dicts names to load
  getDefaultLang: () =>
    (document.querySelector("meta[name='zusam:default-lang']") || {}).content ||
    "en",
  getCurrentLang: () => me.data
      ? me.data["lang"] || lang.getDefaultLang()
      : lang.getDefaultLang(),
  fetchDict: (dict = lang.getCurrentLang()) =>
    !lang.dict[dict] &&
    http.get(`/lang/${dict}.json`).then(r => {
      lang.dict[dict] = r;
      window.dispatchEvent(new CustomEvent("fetchedNewDict"));
    }),
  t: (id, params = {}) => {
    // prepare default values
    params.dict = params["dict"] || lang.getCurrentLang();
    params.count = params["count"] || 0;

    // quick validity checks
    if (!id || !lang.dict[params.dict]) {
      return "";
    }

    // select translation string corresponding to count
    // We treat the list of translation keys like ranges
    // So if we have the keys 0, 1, 5; we have the ranges [0], [1, 4], [5, +inf]
    let str = lang.dict[params.dict][id] || "";
    if (typeof str == "object") {
      let keys = Object.getOwnPropertyNames(str)
        .map(e => +e)
        .filter(e => !isNaN(e) && e <= params.count)
        .sort((a, b) => a - b);
      str = keys.length ? str[keys.slice(-1)[0]] : "";
    }

    // replace parameters
    Object.assign([], str.match(/{{\w+}}/g)).forEach(s => {
      let rid = s.replace(/[{}]/g, "");
      if (params[rid]) {
        str = str.replace(s, params[rid]);
      }
    });

    return str;
  }
};
export default lang;
