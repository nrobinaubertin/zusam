import { h, Component } from "preact";
import { me } from "/core";
import { Redirect } from "react-router-dom";

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      loaded: false,
      redirect: "",
    };
  }

  componentDidMount() {
    me.fetch().then(user => {
      let connected = false;
      let redirect = "/login";
      if (user) {
        connected = true;
        redirect = "/create-group";
        if (user.data?.default_group) {
          redirect = `/groups/${user?.data["default_group"]}`;
        } else if (user?.groups[0]) {
          redirect = `/groups/${user?.groups[0].id}`;
        }
      }
      this.setState({
        loaded: true,
        connected,
        redirect,
      });
    });
  }

  render() {
    if (!this.state.loaded) {
      return null;
    }
    return (
      <Redirect to={this.state.redirect} />
    );
  }
}
