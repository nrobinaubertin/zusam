import { h, Component } from "preact";
import { http } from "/core";
import { FaIcon } from "/misc";
import { Navbar } from "/navbar";
import { MessagePreview } from "/message";
import { GroupTitle } from "/pages";
import { Link } from "react-router-dom";

export default class GroupBoard extends Component {
  constructor(props) {
    super(props);
    let loaded = 1 + Math.floor((window.screen.width * window.screen.height) / (320 * 215));
    this.state = {
      loaded,
      messages: [],
      scrollTop: 0,
      totalMessages: 0,
      pageYOffset: 0,
      page: 0
    };
    this.scroll_cooldown = Date.now();
    this.onScroll = this.onScroll.bind(this);
    this.loadMessages = this.loadMessages.bind(this);
    this.onNewParent = this.onNewParent.bind(this);
    window.addEventListener("newParent", this.onNewParent);
  }

  onNewParent() {
    this.loadMessages(0);
  }

  componentDidMount() {
    this.loadMessages(0);
    window.addEventListener("scroll", this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  }

  loadMessages(page) {
    http
      .get(`/api/groups/${this.props.id}`)
      .then(res => {
        this.setState({
          group: res
        });
      });

    http
      .get(`/api/groups/${this.props.id}/page/${page}`)
      .then(res => {
        if (res && Array.isArray(res["messages"])) {
          let new_loaded = Math.max(this.state.loaded, page * 30);
          let msgList = this.state.messages;
          // don't add already added messages
          res["messages"].map(
            m => !msgList.find(msg => msg.id == m.id) && msgList.push(m)
          );
          this.setState({
            messages: msgList,
            totalMessages: res["totalItems"],
            page,
            loaded: new_loaded
          });
          if ((page + 1) * 30 < new_loaded) {
            setTimeout(() => this.loadMessages(page + 1));
          }
        }
      });
  }

  onScroll() {
    // prevent loading messages if we are in a post
    if (
      window.getComputedStyle(document.getElementById("group").parentNode)
        .display == "none"
    ) {
      return;
    }
    // don't load if on cooldown
    if (this.scroll_cooldown + 100 < Date.now()) {
      this.scroll_cooldown = Date.now();
      this.setState({ pageYOffset: window.pageYOffset });
      // don't load if unecessary
      if (
        Array.isArray(this.state.messages) &&
        document.body.scrollHeight - window.screen.height - 500 <
          window.pageYOffset &&
        this.state.loaded < this.state.totalMessages
      ) {
        this.setState(prevState => ({ loaded: prevState.loaded + 10 }));
        if (this.state.loaded + 30 > this.state.messages.length) {
          this.loadMessages(this.state.page + 1);
          // update page count right away
          this.setState(prevState => ({ page: prevState.page + 1 }));
        }
      }
    }
  }

  render() {
    if (!this.props.id) {
      return;
    }
    return (
      <main>
        <Navbar />
        <div class="content">
          <div>
              <div>
                <GroupTitle />
                <article id="group" class="justify-content-center d-flex">
                  <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                    {Array.isArray(this.state.messages) && this.state.messages.slice(0, this.state.loaded).map((msg, i) => {
                      return (
                        <MessagePreview
                          tabindex={i + 1}
                          key={msg.id}
                          message={msg}
                          groupId={this.props.id}
                        />
                      );
                    })}
                  </div>
                </article>
              </div>
            <Link
              class="write-button material-shadow seamless-link"
              to={`/groups/${this.props.id}/write`}
            >
              <FaIcon family={"solid"} icon={"pencil-alt"} />
            </Link>
          </div>
        </div>
      </main>
    );
  }
}
