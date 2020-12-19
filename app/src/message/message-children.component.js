import { h, Component } from "preact";
import { lang, router, util } from "/core";
import MessageChild from "./message-child.component.js";

export default class MessageChildren extends Component {
  constructor(props) {
    super(props);
    this.onNewChild = this.onNewChild.bind(this);
    this.loadMessage = this.loadMessage.bind(this);
    this.displayPreviousChildren = this.displayPreviousChildren.bind(this);
    this.displayNextChildren = this.displayNextChildren.bind(this);
    this.state = { firstDisplayedChild: 0, lastDisplayedChild: 0 };
    window.addEventListener("newChild", this.onNewChild);
  }

  onNewChild(event) {
    const newMsg = event.detail;
    if (newMsg.parent && util.getId(newMsg.parent) == this.props.id) {
      this.setState(prevState => ({
        lastDisplayedChild: prevState.lastDisplayedChild + 1
      }));
    }
  }

  loadMessage() {
    let firstDisplayedChild = 0;
    let lastDisplayedChild = 0;
    if (this.props.childMessages.length) {
      let msgIndex = router.action
        ? this.props.childMessages.findIndex(e => e && e.id === router.action)
        : -1;
      if (msgIndex != -1) {
        firstDisplayedChild = Math.max(0, msgIndex - 1);
        lastDisplayedChild = Math.min(
          this.props.childMessages.length,
          msgIndex + 1
        );
      } else {
        firstDisplayedChild =
          this.props.childMessages && this.props.childMessages.length - 5; // display the last 5 children
        lastDisplayedChild =
          this.props.childMessages && this.props.childMessages.length;
      }
    }
    this.setState({
      firstDisplayedChild,
      lastDisplayedChild
    });
  }

  displayPreviousChildren() {
    this.setState(prevState => ({
      firstDisplayedChild: Math.max(0, prevState.firstDisplayedChild - 10)
    }));
  }

  displayNextChildren() {
    this.setState(prevState => ({
      lastDisplayedChild: Math.min(
        this.props.childMessages.length,
        prevState.lastDisplayedChild + 10
      )
    }));
  }

  componentDidMount() {
    this.loadMessage();
  }

  render() {
    if (
      this.state.lastDisplayedChild - this.state.firstDisplayedChild < 1 ||
      !this.props.childMessages
    ) {
      return null;
    }
    return (
      <div class="children">
        {this.state.firstDisplayedChild > 0 && (
          <div class="d-flex">
            <a
              class="more-coms unselectable"
              onClick={() => this.displayPreviousChildren()}
            >
              {lang.t("previous_coms")}
            </a>
          </div>
        )}
        {this.props.childMessages.map((e, i) => {
          // bypass empty messages
          if (!e.files.length && e.data["text"] == "" && !e.children.length) {
            return null;
          }

          if (
            i < this.state.firstDisplayedChild ||
            i > this.state.lastDisplayedChild
          ) {
            return null;
          }

          return (
            <MessageChild
              id={e.id}
              key={e.id}
              isPublic={this.props.isPublic}
            />
          );
        })}
        {this.state.lastDisplayedChild + 1 <
          this.props.childMessages.length && (
          <div class="d-flex">
            <span
              class="more-coms unselectable"
              onClick={() => this.displayNextChildren()}
            >
              {lang.t("next_coms")}
            </span>
          </div>
        )}
      </div>
    );
  }
}
