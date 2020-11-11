import { h, Component } from "preact";
import { util, me } from "/core";
import Message from "./message.component.js";

export default class MessageParent extends Component {
  constructor(props) {
    super(props);
    this.onNewChild = this.onNewChild.bind(this);
    window.addEventListener("newChild", this.onNewChild);
    this.state = { message: this.props.message };
  }

  componentDidMount() {
    me.removeMatchingNotifications(this.props.message.id);
    setTimeout(() => window.scrollTo(0, 0));
  }

  onNewChild(event) {
    const newMsg = event.detail;
    let msg = this.state.message;
    if (newMsg.parent && util.getId(newMsg.parent) == msg["id"]) {
      newMsg.author = me.get();
      msg.children = [...msg.children, newMsg];
      this.setState(prevState => ({
        lastDisplayedChild: prevState.lastDisplayedChild + 1,
        message: msg
      }));
    }
  }

  render() {
    // don't display the message if not loaded or removed
    if (!this.state.message || this.state.isRemoved) {
      return;
    }

    return (
      <Message
        message={this.state.message}
        focus={this.props.focus}
        isPublic={this.props.isPublic}
        isChild={false}
       />
    );
  }
}
