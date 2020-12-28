import { h, Component } from "preact";
import { util, http, lang, router, me } from "/core";
import { MessagePreview } from "/message";
import store from "/store";
import { Link } from "react-router-dom";

export default class BookmarkBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    }
    this.loadBookmarks = this.loadBookmarks.bind(this);
    store.on('@change', () => {
      this.loadBookmarks();
    })
  }

  loadBookmarks() {
    if (me.me && me.me.data && Array.isArray(me.me.data.bookmarks)) {
      Promise.all(me.me.data.bookmarks.map(bid => {
        return http.get(`/api/messages/${bid}`);
      })).then(messages => this.setState({messages}));
    }
  }

  componentDidMount() {
    this.loadBookmarks();
  }

  render() {
    if (!Array.isArray(this.state.messages) || this.state.messages.length < 1) {
      return;
    }
    return (
      <div>
        <Link to={util.toApp("/bookmarks")} class="no-decoration">
          <div class="group-name">{lang.t("bookmarks")}</div>
        </Link>
        <article id="group" class="justify-content-center d-flex">
          <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
            {this.state.messages.filter(m => m?.id).map((msg, i) => {
              return (
                <MessagePreview
                  tabindex={i + 1}
                  key={msg.id}
                  message={msg}
                  groupId={msg.group.id}
                />
              );
            })}
          </div>
        </article>
      </div>
    );
  }
}
