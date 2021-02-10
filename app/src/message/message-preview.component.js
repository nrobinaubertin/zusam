import { h, Component } from "preact";
import { http, me, router, util } from "/core";
import { FaIcon } from "/misc";

export default class MessagePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      author: null,
    };
  }

  componentDidMount() {
    if (this.props.message && this.props.message.author) {
      if (typeof(this.props.message.author) == "string") {
        http
          .get(`/api/users/${this.props.message.author}`)
          .then(author => author && this.setState({ author }));
      } else {
        this.setState({author: this.props.message.author});
      }
    }
  }

  getAvatar(user) {
    return (
      <img
        title={user ? user.name : "--"}
        className={`avatar material-shadow${user ? "" : " removed-user"}`}
        style={util.backgroundHash(user ? user.id : "")}
        src={
          user && user.avatar
            ? util.crop(user.avatar["id"], 100, 100)
            : util.defaultAvatar
        }
        onError={e => (e.currentTarget.src = util.defaultAvatar)}
      />
    );
  }

  render() {
    if (!this.props.message) {
      return null;
    }
    return (
      <a
        class="d-inline-block seamless-link message-preview unselectable"
        href={router.toApp(`/messages/${this.props.message.id}`)}
        onClick={e => router.onClick(e)}
        title={this.props.message.data["title"]}
      >
        <div tabindex={this.props.tabindex} class="card material-shadow-with-hover">
          {this.getAvatar(this.state.author)}
          {this.props.message.preview ? (
            <div
              class="card-miniature"
              style={
                `background-image: url('${util.crop(util.getId(this.props.message.preview), 320, 180)}')`
              }
            />
          ) : (
            <div class="text-preview">{this.props.message.data["text"]}</div>
          )}
          <div class="card-body border-top d-flex justify-content-between">
            <span class="left-buffer" />
            <span
              class="title"
              title={
                this.props.message.data["title"] ||
                util.humanFullDate(this.props.message.lastActivityDate)
              }
            >
              {this.props.message.data["title"] ||
                util.humanTime(this.props.message.lastActivityDate)}
            </span>
            <span class="children">
              {!!this.props.message.children && (
                <span>
                  {`${Array.isArray(this.props.message.children) ? this.props.message.children.length : this.props.message.children} `}
                  <FaIcon
                    family={
                      me.isNew(this.props.message.id) ? "solid" : "regular"
                    }
                    icon={"comment"}
                  />
                </span>
              )}
            </span>
          </div>
        </div>
      </a>
    );
  }
}
