import { h, Component } from "preact";
import { util, router } from "/core";
import TwitchEmbed from "./embeds/twitch-embed.component.js";
import BandCampEmbed from "./embeds/bandcamp-embed.component.js";
import GenericEmbed from "./embeds/generic-embed.component.js";

export default class EmbedBlock extends Component {
  getPreview() {
    if (this.props.data["providerUrl"]) {
      switch (
        this.props.data["providerUrl"]
          .toLowerCase()
          .replace(/\/$/, "")
          .replace(/^https?:\/\/(www\.)?/, "")
      ) {
        case "lichess.org":
          let url = this.props.url;
          if (url.match("/study/")) {
            url = url.replace("/study/", "/study/embed/");
          } else {
            url = url.replace("lichess.org/", "lichess.org/embed/");
          }
          let id;
          try {
            id = url.split("/").slice(-1)[0];
          } catch (e) {
            id = "";
          }
          url = url.replace(id, id.slice(0, 8));
          return (
            <GenericEmbed
              preview={util.crop(this.props.preview.id, 270, 270)}
              url={url}
              playBtnClass={"lichess"}
            />
          );
        case "gamerdvr.com":
          if (this.props.data["url"].match(/\/gamer\/\w+\/video\//)) {
            return (
              <GenericEmbed
                preview={util.crop(this.props.preview.id, 1024, 270)}
                url={`${this.props.data["url"]  }/embed`}
                playBtnClass={"gamerdvr"}
              />
            );
          }
          break;
        case "youtube.com":
          if (this.props.data["type"] == "video" && this.props.data["code"]) {
            return (
              <GenericEmbed
                preview={util.crop(this.props.preview.id, 1024, 270)}
                url={
                  `${this.props.data["code"].match(/https:\/\/[^"\s]+/)[0] 
                  }&autoplay=1&controls=2&wmode=opaque`
                }
                playBtnClass={"youtube"}
              />
            );
          }
          break;
        case "soundcloud.com":
          if (this.props.data["code"]) {
            return (
              <GenericEmbed
                preview={util.crop(this.props.preview.id, 1024, 270)}
                url={
                  `${this.props.data["code"].match(/https:\/\/[^"\s]+/)[0] 
                  }&auto_play=true`
                }
                playBtnClass={"soundcloud"}
              />
            );
          }
          break;
        case "arte.tv":
          let segments = this.props.data['url'].split("/");
          let videoId = "";
          for (let i = 0; i < segments.length; i++) {
            if (segments[i] == "videos") {
              videoId = segments[i + 1];
              break;
            }
          }
          return (
            <GenericEmbed
              preview={util.crop(this.props.preview.id, 1024, 270)}
              url={
                `https://www.arte.tv/player/v5/index.php?json_url=${
                  encodeURIComponent(`https://api.arte.tv/api/player/v2/config/en/${videoId}`)
                }&lang=en&autoplay=true&mute=0`
              }
              playBtnClass={"generic"}
            />
          );
        case "twitch.tv":
          let splits = this.props.data["url"].split('/');
          if (splits.length > 4 && splits[4]) {
            return (
              <TwitchEmbed
                preview={this.props.preview}
                url={this.props.data["url"]}
              />
            );
          }
          break;
        case "bandcamp.com":
          if (this.props.data["code"]) {
            let id = this.props.data["code"].match(/https:\/\/.*album=\d+/);
            if (!id) {
              id = this.props.data["code"].match(/https:\/\/.*track=\d+/);
            }
            if (id) {
              return (
                <BandCampEmbed
                  preview={util.crop(this.props.preview.id, 1024, 270)}
                  url={id[0]}
                />
              );
            }
          }
          break;
        case "imgur.com":
          // skip default embed code if it's an imgur image
          if (this.props.data["type"] == "photo") {
            break;
          }
        case "vimeo.com":
        case "dailymotion.com":
        case "facebook.com":
        default:
      }
    }
    if (this.props.data["providerName"]) {
      switch (this.props.data["providerName"].toLowerCase()) {
        case "peertube":
          // default embed code
          if (this.props.data["code"]) {
            return (
              <div class="embed-container" dangerouslySetInnerHTML={{ __html: this.props.data["code"] }} />
            );
          }
        default:
      }
    }
    if (/image/.test(this.props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <img
            data-nlg={!this.props.inWriter}
            href={router.toApp(this.props.url)}
            class="img-fluid cursor-pointer"
            data-origin={this.props.url}
            data-src={
              this.props.preview && !/gif/.test(this.props.data["content-type"])
                ? util.thumbnail(this.props.preview.id, 1366, 768)
                : this.props.url
            }
            src={
              this.props.preview && !/gif/.test(this.props.data["content-type"])
                ? util.thumbnail(this.props.preview.id, 1366, 99999)
                : this.props.url
            }
          />
        </div>
      );
    }
    if (/video/.test(this.props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <video class="img-fluid" controls src={this.props.url} />
        </div>
      );
    }
    if (/audio/.test(this.props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <audio class="w-100" controls>
            <source src={this.props.url} />
          </audio>
        </div>
      );
    }
    if (
      this.props.data["title"] &&
      (this.props.preview || this.props.data["description"])
    ) {
      return (
        <a
          class="preview-card seamless-link d-inline-block"
          target="_blank"
          rel="noreferrer"
          href={router.toApp(this.props.url)}
        >
          <div class="card" style="max-width: 480px">
            {this.props.preview && (
              <img
                class="card-img-top"
                src={util.crop(this.props.preview.id, 320, 180)}
              />
            )}
            <div class="card-body p-1">
              <h5>{this.props.data["title"]}</h5>
              {this.props.data["description"] && (
                <p>
                  <small>{this.props.data["description"].slice(0, 500)}</small>
                </p>
              )}
            </div>
          </div>
        </a>
      );
    }
    return null;
  }

  render() {
    if (!this.props.url || !this.props.data) {
      return null;
    }
    let preview = this.getPreview();
    if (preview) {
      return <p class="text-center card-text">{preview}</p>;
    }
    return null;
  }
}
