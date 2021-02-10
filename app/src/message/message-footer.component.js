import { Fragment, h } from "preact";
import { router, lang, me, util } from "/core";
import { FaIcon } from "/misc";

export default function MessageFooter() {
  return (
    <div class="message-footer">
      <div class="infos">
        {!this.props.isPublic &&
            this.props.author &&
            this.props.author.id == me.me.id && (
              <Fragment>
                <a
                  class="action seamless-link font-size-90 capitalize d-none d-sm-block"
                  onClick={e => this.props.editMessage(e)}
                >
                  {lang.t("edit")}
                </a>
                <div class="dot d-none d-sm-block">&bull;</div>
              </Fragment>
            )}
        {!this.props.isPublic && this.props.isChild && (
          <Fragment>
            <a
              class="action seamless-link font-size-90 capitalize"
              href={router.toApp(
                `/messages/${ 
                    this.props.message.id 
                    }${this.props.message.children.length ? "" : "?focus=reply"}`
              )}
              onClick={e => router.onClick(e)}
            >
              {this.props.message.children.length ? (
                this.props.message.children.some(e => me.isNew(e.id)) ? (
                  <b>
                    {lang.t("replies", {
                      count: this.props.message.children.length
                    })}
                  </b>
                ) : (
                  lang.t("replies", {
                    count: this.props.message.children.length
                  })
                )
              ) : (
                lang.t("reply")
              )}
            </a>
            <div class="dot">&bull;</div>
          </Fragment>
        )}
        <div
          class="date font-size-90"
          title={util.humanFullDate(this.props.message.createdAt)}
        >
          {util.humanTime(this.props.message.createdAt)}
        </div>
        <Fragment>
          <div class="dot">&bull;</div>
          <div class="font-size-90">
            {
              this.props.author && this.props.author.name ? this.props.author.name : "--"
            }
          </div>
        </Fragment>
      </div>
      <div>
        {!this.props.isPublic && (
          <div
            class="options dropdown"
            onClick={e =>
                e.target.closest(".dropdown").classList.toggle("active")
            }
          >
            <div class="none-if-follows-empty">
              <FaIcon family="solid" icon="ellipsis-h" />
            </div>
            <div class="dropdown-menu dropdown-options">
              {this.props.author && this.props.author.id == me.me.id && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.deleteMessage(e)}
                >
                  {lang.t("delete")}
                </a>
              )}
              {
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.openPublicLink(e)}
                >
                  {lang.t("public_link")}
                </a>
              }
              {me.me.groups.length > 1 && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.shareMessage(e)}
                >
                  {lang.t("share_message")}
                </a>
              )}
              {!this.props.message.isInFront &&
                  this.props.author &&
                  this.props.author.id == me.me.id && (
                    <a
                      class="seamless-link capitalize"
                      onClick={e => this.props.publishInGroup(e)}
                    >
                      {lang.t("publish_in_group")}
                    </a>
                  )}
              {!me.hasBookmark(this.props.message.id) && (
                <a
                  class="seamless-link capitalize"
                  onClick={() => me.addBookmark(this.props.message.id)}
                >
                  {lang.t("add_bookmark")}
                </a>
              )}
              {me.hasBookmark(this.props.message.id) && (
                <a
                  class="seamless-link capitalize"
                  onClick={() => me.removeBookmark(this.props.message.id)}
                >
                  {lang.t("remove_bookmark")}
                </a>
              )}
              {this.props.author && this.props.author.id == me.me.id && (
                <a
                  class="seamless-link capitalize"
                  onClick={e => this.props.editMessage(e)}
                >
                  {lang.t("edit")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
