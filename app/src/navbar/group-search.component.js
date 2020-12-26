import { h, Component } from "preact";
import { lang, router, util, http, me } from "/core";
import { MessageSearchResult } from "/message";

export default class GroupSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupId: props.id,
      loaded: false,
      messages: [],
      totalMessages: 0,
      search: "",
      hashtags: "",
    };
    this.loadMessages = this.loadMessages.bind(this);
  }

  getGroupName() {
    if (this.props.me.groups && router.entity.entityType == "group") {
      let group = this.props.me.groups.find(g => g["id"] == util.getId(router.entity));
      return group ? group["name"] : "";
    }
    return "";
  }

  componentWillUnmount() {
    window.removeEventListener("routerStateChange", this.loadMessages);
  }

  componentDidMount() {
    this.loadMessages();
    window.addEventListener("routerStateChange", this.loadMessages);
  }

  loadMessages() {
    const search = router.getParam("search").replace(/\+/g, " ");
    const hashtags = router.getParam("hashtags").replace(/\+/g, " ");
    this.setState({search, hashtags});
    http
      .post("/api/messages/search", {
        group: this.state.groupId,
        search,
        hashtags
      })
      .then(res => {
        if (res && Array.isArray(res["messages"])) {
          this.setState({
            search,
            messages: res["messages"],
            totalMessages: res["totalItems"],
            loaded: true
          });
        }
      });
  }

  render() {
    return (
      Array.isArray(this.state.messages) && (
        <div>
          <article id="group" class="justify-content-center d-flex">
            <div class="search-results-container container-fluid d-flex justify-content-center flex-wrap">
              {this.state.messages.length == 0 && this.state.loaded && (
                <p>{lang.t("search_without_result")}</p>
              )}
              {this.state.messages.map((msg, i) => {
                return (
                  <MessageSearchResult
                    tabindex={i + 1}
                    key={msg.id}
                    message={msg}
                    groupId={this.state.groupId}
                    search={this.state.search}
                    hashtags={this.state.hashtags}
                  />
                );
              })}
            </div>
          </article>
        </div>
      )
    );
  }
}
