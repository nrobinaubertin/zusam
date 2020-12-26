import { h, Component } from "preact";
import { router, util, me } from "/core";
import Message from "./message.component.js";
import { Navbar } from "/navbar";

export default class MessageParent extends Component {
  constructor(props) {
    super(props);
    this.onNewChild = this.onNewChild.bind(this);
    window.addEventListener("newChild", this.onNewChild);
  }

  // TODO FIXME
  onNewChild(event) {
  //  const newMsg = event.detail;
  //  let msg = this.state.message;
  //  if (newMsg.parent && util.getId(newMsg.parent) == msg["id"]) {
  //    newMsg.author = me.get();
  //    msg.children = [...msg.children, newMsg];
  //    this.setState(prevState => ({
  //      lastDisplayedChild: prevState.lastDisplayedChild + 1,
  //      message: msg
  //    }));
  //  }
  }

  render() {
    return (
      <main>
        <Navbar />
        <div class="content">
          <article class="mb-3 justify-content-center d-flex">
            <div class="container pb-3">
              <Message
                focus={!!router.getParam("focus", router.search)}
                isPublic={this.props.isPublic}
                isChild={false}
                id={this.props.id}
               />
            </div>
          </article>
        </div>
      </main>
    );
  }
}
