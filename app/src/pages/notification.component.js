import { h, Component, Fragment } from "preact";
import { http, lang, util } from "/core";
import { Link } from "react-router-dom";

class Notification extends Component {
  constructor(props) {
    super(props);
    this.getMiniature = this.getMiniature.bind(this);
    this.setMiniatureOnError = this.setMiniatureOnError.bind(this);
    this.getAction = this.getAction.bind(this);
    this.getTarget = this.getTarget.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.state = {
      target: this.getTarget(),
      action: this.getAction(),
      title: this.getTitle(),
    };
  }

  getMiniature() {
    let imgSrc = util.defaultAvatar;
    if (
      this.props.fromUser &&
      this.props.fromUser.avatar &&
      this.props.type != "global_notification"
    ) {
      imgSrc = util.crop(this.props.fromUser.avatar["id"], 80, 80);
    }
    return (
      <img
        style={util.backgroundHash(
          this.props.fromUser ? this.props.fromUser.id : ""
        )}
        src={imgSrc}
        onError={e => this.setMiniatureOnError(e)}
      />
    );
  }

  setMiniatureOnError(event) {
    event.currentTarget.src = util.defaultAvatar;
  }

  getAction() {
    switch (this.props.type) {
      case "new_message":
        return lang.t("has_posted_in");
      case "new_comment":
        return lang.t("has_commented_on");
      case "user_joined_group":
        return lang.t("has_joined");
      case "user_left_group":
        return lang.t("has_left");
      case "group_name_change":
        return lang.t("changed_group_name");
      default:
        return "";
    }
  }

  getTitle() {
    switch (this.props.type) {
      case "new_message":
      case "new_comment":
        if (this.props.fromMessage && this.props.fromMessage['data']) {
          if (this.props.fromMessage['data']['title']) {
            return this.props.fromMessage['data']['title'];
          }
          if (this.props.fromMessage['data']['text']) {
            let url = util.getUrl(this.props.fromMessage['data']['text']);
            if (url && url.length > 0) {
              url = url[0];
            }
            if (url) {
              http.get(`/api/links/by_url?url=${encodeURIComponent(url)}`).then(r => {
                this.setState({title: r.data['title'] || r.data['description'] || r.data['url']});
              });
              return url;
            }
            return this.props.fromMessage['data']['text'];
          }
        }
        return "";
      default:
        return "";
    }
  }

  getObject() {
    switch (this.props.type) {
      case "new_message":
        return (
          <Fragment>
            <strong>
              {this.props.fromGroup.name}
            </strong>
            {this.state.title && (
              <Fragment>
                <br />
                <small><em>{util.limitStrSize(this.state.title, 52)}</em></small>
              </Fragment>
            )}
          </Fragment>
        );
      case "new_comment":
        return (
          <span>
            {`${lang.t("the_message_from")  } `}
            <strong>
              {this.props.fromMessage && this.props.fromMessage["author"]
                ? this.props.fromMessage["author"]["name"]
                : ""}
            </strong>
            {this.state.title && (
              <Fragment>
                <br />
                <small><em>{util.limitStrSize(this.state.title, 52)}</em></small>
              </Fragment>
            )}
          </span>
        );
      case "user_joined_group":
      case "user_left_group":
        return (
          <strong>
            {this.props.fromGroup.name}
          </strong>
        );
      case "group_name_change":
        return (
          <span>
            <strong>{this.props.data["previousGroupName"]}</strong>
            {` ${lang.t("to")} `}
            <strong>{this.props.data["newGroupName"]}</strong>
          </span>
        );
      case "global_notification":
        return this.props.data["text"];
      default:
        return "";
    }
  }

  getTarget() {
    switch (this.props.type) {
      case "user_joined_group":
      case "user_left_group":
      case "group_name_change":
        return `/groups/${this.props.fromGroup.id}`;
      case "new_message":
        return `/messages/${this.props.target}`;
      case "new_comment":
        return (
          `/messages/${this.props.fromMessage.id}/${this.props.target}`
        );
      case "global_notification":
        return this.props.target;
      default:
        return "";
    }
  }

  render() {
    return (
      <Link
        class="notification seamless-link unselectable"
        to={this.state.target}
        title={this.state.title}
      >
        <div class="miniature unselectable">{this.getMiniature()}</div>
        <div class="infos">
          <div class="description">
            {this.props.type != "global_notification" && (
              <Fragment>
                <strong>{this.props.fromUser.name || "--"}</strong>
                <span>{` ${this.state.action} `}</span>
              </Fragment>
            )}
            {this.getObject()}
          </div>
          <div class="date">
            {util.humanTime(this.props.createdAt)}
          </div>
        </div>
      </Link>
    );
  }
}

export default Notification;
