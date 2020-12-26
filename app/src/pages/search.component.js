import { h, Component } from "preact";
import { lang, router } from "/core";
import { FaIcon } from "/misc";
import { connectStoreon } from 'storeon/preact'
import { withRouter } from "react-router-dom";

class Search extends Component {
  constructor(props) {
    super(props);
    this.search = this.search.bind(this);
  }

  search(evt) {
    evt.preventDefault();
    let group_id =
    router.route == "messages" ? this.props.entity?.group?.id : this.props.entity?.id;
    // https://stackoverflow.com/a/37511463
    let searchTerms = document
      .getElementById("search")
      .value.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(" ");
    console.log("SEARCH", searchTerms);
    this.props.history.push(
      `/groups/${group_id}?search=${searchTerms.map(e => encodeURIComponent(e)).join("+")}`
    );
  }

  render() {
    if (this.props.entity?.group?.id || this.props.entity?.id) {
      return (
        <form class="navbar-block search-block" onSubmit={e => this.search(e)}>
          <div class="input-group">
            <input
              class="form-control"
              type="text"
              id="search"
              placeholder={lang.t("search_in_group")}
              value={decodeURIComponent(
                router.getParam("search").replace(/\+/g, " ")
              )}
             />
            <div class="input-group-append">
              <button
                class="btn btn-secondary"
                type="submit"
              >
                <FaIcon family={"solid"} icon={"search"} />
              </button>
            </div>
          </div>
        </form>
      );
    }
  }
}

export default withRouter(connectStoreon('entity', Search));
