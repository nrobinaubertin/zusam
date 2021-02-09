// nano lightbox gallery
let nlg = {
  list: [],
  bodyStyle: "",
  nlgStyles: `
        .nlg-left {
            left: -${document.body.clientWidth}px !important;
        }
        .nlg-right {
            left: ${document.body.clientWidth * 2}px !important;
        }
    `,
  clickFn: e => {
    e.preventDefault();
    if (e.ctrlKey) {
      window.open(e.currentTarget.getAttribute("href"), "_blank");
    } else {
      nlg.show(e.currentTarget);
    }
  },
  stop: () => {
    document
      .querySelectorAll("[data-nlg]")
      .forEach(elm => elm.removeEventListener("click", nlg.clickFn));
    window.removeEventListener("routerStateChange", nlg.stop);
    window.removeEventListener("popstate", nlg.stop);
  },
  start: () => {
    nlg.stop();
    nlg.list = [];
    if (!document.getElementById("nlg-styles")) {
      let nlgStyles = document.createElement("style");
      nlgStyles.id = "nlg-styles";
      nlgStyles.innerHTML = nlg.nlgStyles;
      document.body.append(nlgStyles);
    }
    setTimeout(() => {
      document.querySelectorAll("[data-nlg]").forEach(elm => {
        if (
          !nlg.list.find(
            e => e.getAttribute("href") == elm.getAttribute("href")
          )
        ) {
          nlg.list.push(elm);
          elm.addEventListener("click", nlg.clickFn);
        }
      });
    }, 100);
    window.addEventListener("routerStateChange", nlg.stop);
    window.addEventListener("popstate", nlg.stop);
  },
  show: (e, keepBackground = false, side = null) => {
    let url = e.dataset.src || e.src || e.href;
    let media;
    switch (true) {
      case /\.(webm|mp4)$/.test(url):
        media = document.createElement("video");
        media.setAttribute("controls", true);
        break;
      case /\.(pdf)$/.test(url):
        media = document.createElement("iframe");
        break;
      case /\.(jpg|jpeg|png|bmp|webp|gif|svg)$/.test(url):
      default:
        // default displays also thumbnails that do not have an extension
        // TODO: this is a dirty trick
        media = document.createElement("img");
    }
    media.classList.add("nlg-media");
    if (side) {
      media.classList.add(`nlg-${  side}`);
    }
    nlg.bodyStyle = document.body.style.cssText;
    document.body.style.cssText = "overflow: hidden";
    if (!keepBackground) {
      let modalBackground = document.createElement("div");
      modalBackground.id = "nlg-modal-bg";
      modalBackground.addEventListener("click", e => {
        if (e.currentTarget != e.target) {
          return;
        }
        nlg.hide();
      });

      let close = document.createElement("a");
      close.id = "nlg-close";
      close.innerHTML = "&times;";
      close.addEventListener("click", nlg.hide);
      nlg.keyPressClose = e =>
        (e.key == "Escape" || e.code == "Escape") && nlg.hide();
      window.addEventListener("keydown", nlg.keyPressClose);
      document.body.appendChild(close);
      document.body.appendChild(modalBackground);
    }
    let spinner = document.createElement("div");
    spinner.classList.add("spinner");
    for (let i = 0; i < 5; i++) {
      spinner.appendChild(document.createElement("div"));
    }
    setTimeout(() => {
      let spinner = document.querySelector("#nlg-modal-bg .spinner");
      if (spinner) {
        spinner.style.opacity = 1;
      }
    }, 500);
    if (document.getElementById("nlg-modal-bg")) {
      document.getElementById("nlg-modal-bg").appendChild(spinner);
    }
    let modal = document.createElement("div");
    modal.id = "nlg-modal";
    let mediaIsLoadedFn = () => {
      if (!document.getElementById("nlg-modal-bg")) {
        nlg.hide();
        return;
      }
      let spinner = document.querySelector("#nlg-modal-bg .spinner");
      if (spinner) {
        spinner.outerHTML = "";
      }
      if (e.dataset["origin"]) {
        let downloadBtn = document.createElement("a");
        downloadBtn.id = "nlg-origin";
        downloadBtn.href = e.dataset.origin;
        downloadBtn.target = "_blank";
        downloadBtn.innerHTML = `&#128229`;
        downloadBtn.download = (new URL(e.dataset.origin)).pathname.split("/").slice(-1);
        document.body.appendChild(downloadBtn);
      }
      let w = media.tagName == "VIDEO" ? media.videoWidth : media.width;
      let h = media.tagName == "VIDEO" ? media.videoHeight : media.height;
      let ratio = media.tagName == "IFRAME" ? 9/16 : w / h;
      media.width = Math.min(document.body.clientWidth, w);
      media.height = Math.min(document.body.clientHeight, media.width / ratio);
      media.width = media.height * ratio;
      if (media.tagName == "IFRAME") {
        media.height = document.body.clientHeight - 10;
        media.width = Math.max(document.body.clientWidth - 200, document.body.clientWidth * .8);
      }

      let currentIndex = nlg.list.findIndex(
        e => url === (e.dataset.src || e.src || e.href)
      );
      let nextElmt = nlg.list[currentIndex + 1];
      let prevElmt = nlg.list[currentIndex - 1];
      if (nextElmt) {
        let next = document.createElement("a");
        next.classList.add("nlg-next");
        next.innerHTML = "&#10095;";
        let nextFn = () => {
          nlg.moveLeft();
          setTimeout(() => {
            nlg.hide(true);
            nlg.show(nextElmt, true, "right");
          }, 300);
        };
        next.addEventListener("click", nextFn);
        nlg.keyPressRight = e =>
          (e.key == "ArrowRight" || e.code == "ArrowRight") && nextFn(e);
        window.addEventListener("keydown", nlg.keyPressRight);
        modal.appendChild(next);
      }
      if (prevElmt) {
        let prev = document.createElement("a");
        prev.innerHTML = "&#10094;";
        prev.classList.add("nlg-prev");
        let prevFn = () => {
          nlg.moveRight();
          setTimeout(() => {
            nlg.hide(true);
            nlg.show(prevElmt, true, "left");
          }, 300);
        };
        prev.addEventListener("click", prevFn);
        nlg.keyPressLeft = e =>
          (e.key == "ArrowLeft" || e.code == "ArrowLeft") && prevFn(e);
        window.addEventListener("keydown", nlg.keyPressLeft);
        modal.appendChild(prev);
      }
      modal.style.cssText = `opacity: 1;`;
      setTimeout(nlg.center, 1);
    };
    media.addEventListener("load", mediaIsLoadedFn);
    media.addEventListener("loadeddata", mediaIsLoadedFn);
    modal.addEventListener("click", e => {
      if (e.currentTarget != e.target) {
        return;
      }
      nlg.hide();
    });
    modal.appendChild(media);
    document.body.appendChild(modal);
    media.src = url;
    if (media.tagName == "VIDEO") {
      media.play();
    }
  },
  hide: (keepBackground = false) => {
    if (document.getElementById("nlg-modal")) {
      window.removeEventListener("keydown", nlg.keyPressRight);
      window.removeEventListener("keydown", nlg.keyPressLeft);
      document.body.style.cssText = nlg.bodyStyle;
      document.getElementById("nlg-modal").outerHTML = "";
      if (document.getElementById("nlg-origin")) {
        document.getElementById("nlg-origin").outerHTML = "";
      }
      if (keepBackground != true) {
        (document.querySelector("#nlg-close") || {}).outerHTML = "";
        (document.getElementById("nlg-modal-bg") || {}).outerHTML = "";
        window.removeEventListener("keydown", nlg.keyPressClose);
      }
    }
  },
  moveLeft: () =>
    document.querySelector("#nlg-modal > .nlg-media").classList.add("nlg-left"),
  moveRight: () =>
    document
      .querySelector("#nlg-modal > .nlg-media")
      .classList.add("nlg-right"),
  center: () => {
    let media = document.querySelector("#nlg-modal > .nlg-media");
    media.classList.remove("nlg-right");
    media.classList.remove("nlg-left");
  }
};
export default nlg;
