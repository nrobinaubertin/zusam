import { h } from "preact";
import { util, router, me } from "/core";
import { MessageParent } from "/message";
import { CreateGroup, GroupTitle, GroupBoard, Share, BookmarkBoard } from "/pages";
import { Settings } from "/settings";
import { GroupSearch } from "/navbar";
import { FaIcon } from "/misc";
import Writer from "/message/writer.component.js";

export default function MainContent(props) {
  if (props.action == "settings") {
    return (
      <article class="mt-2 justify-content-center d-flex">
        <div class="container pb-3">
          <Settings
            key={props.entityUrl}
            entityUrl={props.entityUrl}
          />
        </div>
      </article>
    );
  }
  switch (props.route) {
    case "create-group":
      return <CreateGroup />;
    case "share":
      return <Share />;
    case "messages":
      return (
        <article class="mb-3 justify-content-center d-flex">
          <div class="container pb-3">
            <GroupTitle
              key={me.getGroupId()}
              id={me.getGroupId()}
              name={me.getGroupName()}
            />
            <MessageParent
              focus={!!router.getParam("focus", router.search)}
              key={router.entity.id}
              message={router.entity}
            />
          </div>
        </article>
      );
    case "bookmarks":
      return (
        <div>
          <BookmarkBoard />
        </div>
      );
    case "groups":
      if (props.action == "write") {
        return (
          <article class="mb-3">
            <div class="container pb-3">
              <GroupTitle
                key={me.getGroupId()}
                id={me.getGroupId()}
                name={me.getGroupName()}
              />
              <Writer focus={true} group={props.id} />
            </div>
          </article>
        );
      }
      if (router.getParam("search") || router.getParam("hashtags")) {
        return (
          <div>
            <GroupSearch key={props.id} />
          </div>
        );
      }
      return (
        <div>
          <GroupBoard key={props.id} />
          <a
            class="write-button material-shadow-with-hover seamless-link"
            href={router.toApp(`/groups/${props.id}/write`)}
            onClick={e => router.onClick(e)}
          >
            <FaIcon family={"solid"} icon={"pencil-alt"} />
          </a>
        </div>
      );
    default:
      // TODO: what should we do here ?
  }
}
