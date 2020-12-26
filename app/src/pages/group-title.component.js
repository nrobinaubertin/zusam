import { h, Component } from "preact";
import { router } from "/core";
import { Link, withRouter } from "react-router-dom";

class GroupTitle extends Component {

  componentDidMount() {
    router.getEntity().then(entity => {
      const groupId = entity?.group?.id || entity?.id;
      const groupName = entity?.group?.name || entity?.name;
      this.setState({id: groupId, name: groupName});
    });
  }

  render() {
    if (this.state?.id && this.state?.name) {
      return (
        <Link
          to={`/groups/${this.state.id}`}
          class="no-decoration"
        >
          <div class="group-name">{this.state.name}</div>
        </Link>
      );
    }
    return null;
  }
}

export default withRouter(GroupTitle);
