import { h, Component } from "preact";
import { router, util, me } from "/core";
import Message from "./message.component.js";

export default class MessageChild extends Component {
  constructor(props) {
    super(props);
    this.state = { message: this.props.message };
  }

  componentDidMount() {
    me.removeMatchingNotifications(this.props.message.id);
  }

  componentWillUpdate() {
    let msgElement = document.getElementById(this.state.message.id);
    if (
      this.state.message.id == router.action &&
      msgElement.classList.contains("highlight")
    ) {
      setTimeout(() => {
        msgElement.scrollIntoView({ block: "start", behavior: "smooth" });
        setTimeout(() => msgElement.classList.remove("highlight"), 1000);
      }, 1000);
    }
  }

  render() {
    if (!this.state.message || this.state.isRemoved) {
      return;
    }
    return (
      <Message
        message={this.state.message}
        isPublic={this.props.isPublic}
        isChild={true}
        preMessageHeadComponent={
          this.state.edit &&
          me.id && (
            <div class="message-head d-none d-md-block">
              <img
                class="rounded-circle w-3 material-shadow avatar"
                style={util.backgroundHash(me.id)}
                src={
                  me.avatar
                    ? util.crop(me.avatar?.id, 100, 100)
                    : util.defaultAvatar
                }
              />
            </div>
          )
        }
       />
    );
  }
}
