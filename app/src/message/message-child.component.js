import { h, Component } from "preact";
import { router, util, me } from "/core";
import Message from "./message.component.js";

export default class MessageChild extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    me.removeMatchingNotifications(this.props.id);
  }

  componentWillUpdate() {
    // TODO FIXME
    //let msgElement = document.getElementById(this.state.message.id);
    //if (
    //  this.state.message.id == router.action &&
    //  msgElement.classList.contains("highlight")
    //) {
    //  setTimeout(() => {
    //    msgElement.scrollIntoView({ block: "start", behavior: "smooth" });
    //    setTimeout(() => msgElement.classList.remove("highlight"), 1000);
    //  }, 1000);
    //}
  }

  render() {
    return (
      <Message
        id={this.props.id}
        isPublic={this.props.isPublic}
        isChild={true}
       />
    );
  }
}
