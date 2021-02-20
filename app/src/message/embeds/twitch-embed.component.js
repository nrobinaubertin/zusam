import { h } from "preact";
import { router } from "/core";

function getEmbedUrl(url) {
  const splits = url.split("/");
  const t = router.getParam("t", url.split("?")[1]);
  if (splits.length > 5 && splits[4] == "clip") {
    return `https://clips.twitch.tv/embed?clip=${splits[5].replace(/\?.*$/, "")}&autoplay=false`;
  }
  if (splits.length > 4 && splits[4]) {
     return `https://player.twitch.tv/?video=${splits[4].replace(/\?.*$/, "")}&autoplay=false${t ? `&t=${t}` : ""}`;
  }
  return url;
}

export default function TwitchEmbed() {
  let embedUrl = getEmbedUrl(this.props.url);
  return (
    <div class="embed-responsive embed-responsive-16by9">
      <iframe
        allowfullscreen
        class="embed-responsive-item"
        src={`${embedUrl}&parent=${location.hostname}`}
      />
    </div>
  );
}
