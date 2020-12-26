import { h, Component } from "preact";
import { util, me, http, storage, router } from "/core";
import { Link, withRouter } from "react-router-dom";

class GroupTitle extends Component {

  // TODO refactor entity url looking
  componentDidMount() {
    const newState = router.getUrlComponents(util.toApp(this.props.location.pathname));
    storage.get("apiKey").then(apiKey => {
      if (apiKey && newState.id && router.isEntity(newState?.route)) {
        newState.entityUrl = `/api/${newState.route}/${newState.id}`;
        newState.entityType = newState.route;

        http.get(newState.entityUrl).then(res => {
          if (!res) {
            console.warn("Unknown entity");
            // TODO: what should we do here ?
            //newState.navigate(); // could go into navigate loop if disconnected
            return;
          }
          newState.entity = res;
          const groupId = newState.entity?.group?.id || newState.entity?.id;
          const groupName = newState.entity?.group?.name || newState.entity?.name;
          this.setState({id: groupId, name: groupName});
        });
      }
    });
  }

  //const { dispatch, entity } = useStoreon('entity');
  //const groupId = entity?.group?.id || entity?.id;
  //const groupName = entity?.id == groupId ? entity?.name : me.getGroupName(groupId);

  //let history = useHistory();
  //history.listen((location, action) => {
  //  // location is an object like window.location
  //  console.log(action, location.pathname, location.state)
  //  console.log("DETECTED INDEX");
  //  router.recalculate(location.pathname);
  //});

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
