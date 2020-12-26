import { h } from "preact";
import Message from "./message.component.js";

export default function MessageChild() {
  return (
    <Message
      id={this.props.id}
      isPublic={this.props.isPublic}
      isChild={true}
     />
  );
}
