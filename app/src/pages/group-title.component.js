import { h } from "preact";
import { Link } from "react-router-dom";

export default function GroupTitle() {
  return (
    <Link
      to={`/groups/${this.props.id}`}
      class="no-decoration"
    >
      <div class="group-name">{this.props.name}</div>
    </Link>
  );
}
