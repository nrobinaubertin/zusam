import lang from "./lang.js";
import router from "./router.js";
import me from "./me.js";
import storage from "./storage.js";

const util = {
  // genId starts with a letter to be DOM friendly
  // seed can be used to order ids
  genId: seed => `z${seed || ""}-${Date.now().toString().slice(-5)}${Math.random().toString().slice(-5)}`,
  // transform an id into int for the API (TODO: revisit this on 0.5)
  id2Int: id => parseInt(id.replace(/[^\d]/g,''), 10),
  urlRegExp: /(\([^()]*)?https?:\/\/[^[\]\n\r ]*[-A-Za-z0-9+&@#/%=~_()|]/i,
  getUrl: txt => {
    if (!txt) {
      return "";
    }
    let url = txt.match(util.urlRegExp);
    if (url && url[0].startsWith("(")) {
      let link = url[0].match(/https?:\/\//i);
      url["index"] += link["index"];
      url[0] = url[0].slice(link["index"]);
      if (url[0].endsWith(")")) {
        url[0] = url[0].slice(0, -1);
      }
    }
    return url;
  },
  limitStrSize: (str, limit) => str.length > limit ? `${str.slice(0, limit-3)}...` : str,
  // full datetime as a string adapted to the users timezone
  humanFullDate: timestamp => {
    let d = new Date(timestamp * 1000);
    d = new Date(d.getTime() + d.getTimezoneOffset() * 60000 * -1);
    return d.toISOString().replace("T", " ").replace(/\..*$/, "");
  },
  // duration relative to event
  humanTime: timestamp => {
    if (!timestamp) {
      return null;
    }
    const duration = Math.abs(Math.round((Date.now() / 1000 - timestamp) / 60));
    if (duration < 1) {
      return lang.t("just_now");
    }
    if (duration < 60) {
      return lang.t("ago", { duration: `${duration  }mn` });
    }
    if (duration < 60 * 24) {
      return lang.t("ago", { duration: `${Math.floor(duration / 60)  }h` });
    }
    return util.humanFullDate(timestamp).split(" ")[0];
  },
  getGroupId: () => {
    if (me.me.groups) {
      switch (router.entity.entityType) {
        case "group":
          return util.getId(router.entity);
        case "message":
          return util.getId(router.entity.group);
      }
    }
    return "";
  },
  getGroupName: () => {
    let group = me.me.groups.find(g => g["id"] == util.getGroupId());
    return group ? group["name"] : "";
  },
  // get the id of an object from an url
  getId: e => {
    switch (typeof e) {
      case "object":
        return e ? e.id : null;
      case "string":
        return e
          .split("/")
          .pop()
          .replace(/\?.*$/, "")
          .replace(/\.\w+$/, "");
      default:
        console.error(e);
        throw "Could not extract id !";
    }
  },
  // get the url to a thubmnail
  thumbnail: (id, width, height) =>
    typeof(id) == "string" && !id.startsWith("z")
      ? router.toApp(`/api/images/thumbnail/${width}/${height}/${id}`)
      : null,
  // same as http.thumbnail but for a crop
  crop: (id, width, height) =>
    typeof(id) == "string" && !id.startsWith("z")
      ? router.toApp(`/api/images/crop/${width}/${height}/${id}`)
      : null,
  // default avatar in base64
  defaultAvatar:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAQMAAADOtka5AAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlMA/iyWEiMAAAMJSURBVHja7ZtBjpwwEEWxmIhFFmiURZZEyi6HCLkZHCXr2eQKHIUjoEiRSGRRiWB6klaDU/hDF4z+W6LuNz3+ZRvbkCSEEEIIIYQQQgghhBBCCCGEEEIIITvwGfy+kxoTpNJigkw6TJBLjwkK8ZiglMFYUInAAqwQRKRBBR0q8FhXEKwVR0GLCvxCjeo6oyzkoIxnEvj5661acPO3yvFqpxdcV+Pj88VeNZ7cGB4ul1QFkv399KT4KBIpmGEwF4i9oL6DIN/3FzToL2ju8AvsBeE2aNFfQMFJBCkF0/R+bkHyCgSVuaDcVaC5zyvMBTkqyHYVaBZDKSpw5oJgLcMC5doXFBSoIMNutjcQBHJULmlhQYUKlmNQbs9kqGC5P2o3FqBBOVjMWkEOdcZQKam3dyqkkgP/g35zxmEpLhbjir0ZFz2tXHgbPR5deI+EMPKmig/hhU/fIkOYL4iYDbIyqpCXajp2Zy4yhNuxqUfbMCaEIraQZ9swJgQBQ0jBQr6eYXrzQrYIYdtC9uaFbDKayJajyTkL+VijyWA+mnBajGpDeFrMzAu5BNvwKoQBDaFHQ+jQEBo0hBoMYUBD8GgIHRpCi44mcAiJRQhoITvzQs63LGQxL2SOJnEhiHUI296bwNOixb1JYr5kz8yX7Odf6XDfBC9kd6yVzq+np69QIY/8AEJ45kt0T4hIM0VONm5CiLlVhLflS+CwdTGEVa2AnfOFTogaVAAfcg1QivpqzLFHD4LnrR0q8FAhqlux3PPUu0EFLSrooL6kLeaQwKMCTY4OfUjVoY+IOvTxSFiw81NtnbmgRwXeXDAg08IxBPIKBPX5BQ0FBxC0+wtSCg4gcBT853nruwiqfQXNHQT/LDiGD9Old6sEL2umn3MtqxDks9NotVbwfaG+FDfL6fznsjV32365cTXrtqoPdJKYrbmreIDvT42DCMYoIUEu4FvIKSpwgr6JvYEAfJm8QgUl+j58gb6Rn4Nvcv/p0jUmcODr8IQQQgghhBBCCCGEEEIIIYQQQgghs/wGp6uYgtiKODIAAAAASUVORK5CYII=",
  hash: str =>
    str.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt()) | 0),
  colorHash: str =>
    [
      "#000000",
      "#333366",
      "#333399",
      "#3333CC",
      "#339933",
      "#339999",
      "#33CC33",
      "#33CC99",
      "#663333",
      "#663366",
      "#666633",
      "#666699",
      "#66CC33",
      "#66CCCC",
      "#993333",
      "#993366",
      "#993399",
      "#996633",
      "#999966",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC6633",
      "#CC9933",
      "#CC99CC",
      "#CCCC33"
    ][Math.abs(util.hash(str)) % 27],
  backgroundHash: str => {
    if (!str) {
      return "background-color: #aaa;";
    }
    let c1 = util.colorHash(str);
    let c2 = util.colorHash(
      str
        .split("")
        .reverse()
        .join(".")
    );
    let deg = 45 * (Math.abs(util.hash(str)) % 4);
    return (
      `background-color:${c1};background-image:linear-gradient(${deg}deg, ${c2} 15%, transparent 15% 30%, ${c2} 30% 45%, transparent 45% 60%, ${c2} 60% 75%, transparent 75% 90%, ${c2} 90%);`
    );
  },
  logout: () => {
    storage.reset();
    window.location.href = window.location.origin;
  },
  // Accepts a keydown event and checks if it's enter. Compatibility between browsers
  // We do it the permissive way
  is_it_enter: e => {
    return e.keyCode == 13 || e.keyCode == 10 || e.key == "Enter" || e.key == "↵" || e.code == "Enter";
  }
};
export default util;
