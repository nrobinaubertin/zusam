import { h } from "preact";
import { router, util } from "/core";

export default function GroupTitle() {
  return (
    <a
      href={util.toApp(`/groups/${  this.props.id}`)}
      onClick={e => router.onClick(e)}
      class="no-decoration"
    >
      <div class="group-name">{this.props.name}</div>
    </a>
  );
}
