import { Fragment, h, Component } from "preact";
import { lang, http, router, util, me, cache } from "/core";
import MessageChildren from "./message-children.component.js";
import MessageHead from "./message-head.component.js";
import MessageFooter from "./message-footer.component.js";
import MessageBody from "./message-body.component.js";
import { GroupTitle } from "/pages";
import Writer from "./writer.component.js";
import { withRouter } from "react-router-dom";

class Message extends Component {
  constructor(props) {
    super(props);
    this.getComponentClass = this.getComponentClass.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.shareMessage = this.shareMessage.bind(this);
    this.publishInGroup = this.publishInGroup.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.onEditMessage = this.onEditMessage.bind(this);
    this.openPublicLink = this.openPublicLink.bind(this);
    window.addEventListener("editMessage", this.onEditMessage);
  }

  componentDidMount() {
    cache.fetch(`/api/messages/${this.props.id}`).then(m => {
      this.setState({message: m});
    });

    me.removeMatchingNotifications(this.props.id);

    if (!this.props.isChild) {
      setTimeout(() => window.scrollTo(0, 0));
    }

    setTimeout(() => {
      if (this.props.id == router.action) {
        const msgElement = document.getElementById(this.props.id);
        msgElement.scrollIntoView({ block: "start", behavior: "smooth" });
        setTimeout(() => msgElement.classList.remove("highlight"), 1000);
      }
    }, 1000);

  }

  async openPublicLink(event) {
    event.preventDefault();
    let newTab = window.open("about:blank", "_blank");
    const res = await http.get(
      `/api/messages/${this.props.id}/get-public-link`
    );
    newTab.location = `${document.baseURI}public/${res.token}`;
  }

  onEditMessage(event) {
    if (event.detail.id == this.props.id) {
      this.props.key = +Date.now();
      let msg = this.state.message;
      msg.data = event.detail.data;
      msg.files = event.detail.files;
      this.setState({
        message: msg,
        data: msg.data,
        gotPreview: false
      });
      setTimeout(() => this.setState({ edit: false }));
    }
  }

  getComponentClass() {
    let cn = "message";
    if (this.props.isChild) {
      cn += " child";
    }
    if (this.props.id == router.action) {
      cn += " highlight";
    }
    return cn;
  }

  deleteMessage(event) {
    event.preventDefault();
    if (confirm(lang.t("ask_delete_message"))) {
      http.delete(`/api/messages/${this.props.id}`);
      if (this.props.isChild) {
        this.setState({isRemoved: true});
      } else {
        this.props.history.push(`/groups/${this.state.message.group.id}`, {
          data: {resetGroupDisplay: true}
        });
      }
    }
  }

  shareMessage(event) {
    event.preventDefault();
    this.props.history.push(`/share?message=${this.props.id}`);
  }

  editMessage(event) {
    event.preventDefault();
    this.setState({ edit: true });
  }

  publishInGroup() {
    http
      .put(`/api/messages/${this.props.id}`, {
        lastActivityDate: Math.floor(Date.now() / 1000),
        isInFront: true
      })
      .then(res => {
        if (!res) {
          alert.add(lang.t("error"), "alert-danger");
          return;
        }
        this.props.history.push(`/groups/${this.state.message.group.id}`);
      });
  }

  cancelEdit(event) {
    event.preventDefault();
    this.setState({ edit: false });
  }

  displayWriter(isChild, focus) {
    return (
      <Writer
        cancel={this.state.edit ? this.cancelEdit : null}
        files={this.state.edit ? this.state.message.files : []}
        focus={focus || !!this.state.edit}
        group={this.state.message.group}
        messageId={this.state.edit ? this.props.id : null}
        parent={
          this.state.edit ? this.state.message["parent"] : this.props.id
        }
        text={this.state.edit ? this.state.message.data["text"] : ""}
        title={this.state.edit ? this.state.message.data["title"] : ""}
        isChild={isChild}
      />
    );
  }

  render() {
    if (this.state?.isRemoved || !this.state?.message) {
      return null;
    }
    return (
      <Fragment>
        {!this.props.isChild && (
          <GroupTitle />
        )}
        <div id={this.props.id} className={this.getComponentClass()}>
          {this.state.edit && this.displayWriter(this.props.isChild)}
          {!this.state.edit && (
            <Fragment>
              {this.props.isChild && this.state.edit && (
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
              )}
              <MessageHead
                author={this.state.message["author"]}
                message={this.state.message}
                isPublic={this.props.isPublic}
                isChild={this.props.isChild}
              />
              <div class="main">
                <MessageBody
                  message={this.state.message}
                  isPublic={this.props.isPublic}
                  isChild={this.props.isChild}
                />
                <MessageFooter
                  author={this.state.message["author"]}
                  message={this.state.message}
                  editMessage={this.editMessage}
                  deleteMessage={this.deleteMessage}
                  shareMessage={this.shareMessage}
                  publishInGroup={this.publishInGroup}
                  openPublicLink={this.openPublicLink}
                  isPublic={this.props.isPublic}
                  isChild={this.props.isChild}
                />
              </div>
            </Fragment>
          )}
        </div>
        {this.props.postMessageComponent}
        {!this.props.isChild && (
          <MessageChildren
            childMessages={this.state.message.children}
            isPublic={this.props.isPublic}
            key={this.props.id}
            id={this.props.id}
          />
        )}
        {!this.state.edit && !this.props.isPublic && !this.props.isChild && (
          <div class="message child mt-2">
            {me.id && (
              <div class="message-head d-none d-md-block">
                <img
                  class="rounded-circle w-3 material-shadow avatar"
                  style={util.backgroundHash(me.id)}
                  src={
                    me.avatar
                      ? util.crop(me.avatar["id"], 100, 100)
                      : util.defaultAvatar
                  }
                />
              </div>
            )}
            {this.displayWriter(true, this.props.focus)}
          </div>
        )}
      </Fragment>
    );
  }
}

export default withRouter(Message);
