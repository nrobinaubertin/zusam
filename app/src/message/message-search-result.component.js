import { h, render, Component } from "preact";
import { cache, me, router, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class MessageSearchResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message,
        };
        if (props.message.author) {
            cache.get("/api/users/" + props.message.author).then(author => author && this.setState({author: author}));
        }
        this.setState({
            title: props.message.data["title"] || "",
            text: props.message.data["text"] || ""
        });
        if (props.message.preview) {
            this.setState({preview: props.message.preview});
        }
        this.getMiniature = this.getMiniature.bind(this);
        this.getLink = this.getLink.bind(this);
        this.displayMessageTitle = this.displayMessageTitle.bind(this);
        this.displayMessageText = this.displayMessageText.bind(this);
    }

    displayMessageTitle() {
        if (!this.props.message.data || !this.props.message.data["title"]) {
            return {__html: util.humanTime(this.props.message.lastActivityDate)};
        }
        // escape html a little (just enough to avoid xss I hope)
        let title = this.props.message.data["title"].replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

        // make the search terms stand out
        let words = title.split(" ");
        for (let j = 0; j < words.length; j++) {
            if (!words[j].match(util.urlRegExp)) {
                let searchTerms = this.props.search.split(" ");
                for(let k = 0; k < searchTerms.length; k++) {
                    words[j] = words[j].replace(new RegExp(searchTerms[k], "gi"), "<b>$&</b>");
                }
            }
        }
        title = words.join(" ");
        return {__html: title};
    }

    displayMessageText() {
        if (!this.props.message.data || !this.props.message.data["text"]) {
            return "";
        }

        // escape html a little (just enough to avoid xss I hope)
        let txt = this.props.message.data["text"].replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

        // make the search terms stand out for not url words
        let lines = txt.split("\n");
        for(let i = 0; i < lines.length; i++) {
            let words = lines[i].split(" ");
            for (let j = 0; j < words.length; j++) {
                if (!words[j].match(util.urlRegExp)) {
                    let searchTerms = this.props.search.split(" ");
                    for(let k = 0; k < searchTerms.length; k++) {
                        words[j] = words[j].replace(new RegExp(searchTerms[k], "gi"), "<b>$&</b>");
                    }
                }
            }
            lines[i] = words.join(" ");
        }
        txt = lines.join("\n"); 

        // replace url by real links
        let shift = 0;
        let match = null;
        while (match = util.getUrl(txt.slice(shift))) {
            let url = match[0];
            if (url.length >= 50) {
                url = url.slice(0, 25) + "..." + url.slice(-24);
            }
            let searchTerms = this.props.search.split(" ");
            for(let i = 0; i < searchTerms.length; i++) {
                url = url.replace(new RegExp(searchTerms[i], "gi"), "<b>$&</b>");
            }
            let link = '<a href="' + match[0] + '" target="_blank">' + url + '</a>';
            txt = txt.slice(0, match["index"] + shift) + link + txt.slice(match["index"] + shift + match[0].length);
            shift += match["index"] + link.length;
        }

        // replace line returns
        txt = txt.replace(/\n/g, '<br/>');

        return {__html: txt};
    }

    getMiniature() {
        if (this.state.preview) {
            return (
                <div
                    class="card-miniature"
                    style={"background-image: url('" + util.crop(this.state.preview, 100, 100) + "')"}
                />
            );
        }
        let avatar = util.defaultAvatar;
        if (this.state.author && this.state.author.avatar && this.state.author.avatar.id) {
            avatar = util.crop(this.state.author.avatar["id"], 100, 100);
        }
        return (
            <div
                class="card-miniature"
                style={"background-image: url('" + avatar + "')"}
            />
        );
    }

    getLink() {
        if (this.state.message.parent && this.state.message.children == 0) {
            return "/messages/" + this.state.message.parent + "/" + this.state.message.id;
        }
        return "/messages/" + this.state.message.id;
    }

    render() {
        return (
            <a
                class="d-inline-block seamless-link message-preview unselectable"
                href={this.getLink()}
                onClick={router.onClick}
                title={this.state.title}
            >
                <div tabindex={this.props.tabindex} class="card material-shadow">
                    <div class="card-body border-top d-flex justify-content-between">
                        { this.getMiniature() }
                        <div class="result-body">
                            <div class="infos">
                                <div class="title">
                                    { this.state.author ? this.state.author.name : "--" }
                                </div>
                                <div class="dot">&bull;</div>
                                <div
                                    class="title"
                                    title={ this.state.title || util.humanFullDate(this.state.message.lastActivityDate)}
                                    dangerouslySetInnerHTML={this.displayMessageTitle()}
                                >
                                </div>
                            </div>
                            <div class="text">
                                { this.state.text.trim() && (
                                    <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>
                                )}
                            </div>
                            <div class="children">
                                { !!this.state.message.children && (
                                    <span>
                                        { this.state.message.children + " " }
                                        <FaIcon family={me.isNew(this.state.message.id) ? "solid" : "regular"} icon={"comment"} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        );
    }
}
