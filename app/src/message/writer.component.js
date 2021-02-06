import { h, Component } from "preact";
import { lang, alert, http, me, router, util, api } from "/core";
import { FaIcon } from "/misc";
import EmbedBlock from "./embed-block.component.js";
import FileGrid from "./file-grid.component.js";

export default class Writer extends Component {

  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.genPreview = this.genPreview.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.putMessage = this.putMessage.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.toggleFile = this.toggleFile.bind(this);
    this.inputImages = this.inputImages.bind(this);
    this.inputVideo = this.inputVideo.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.manageWorkers = this.manageWorkers.bind(this);
    this.removeWorker = this.removeWorker.bind(this);
    this.addWorker = this.addWorker.bind(this);
    this.state = {
      files: [],
      writerId: util.genId(),
      workers: [],
      workerManager: setInterval(this.manageWorkers, 1000),
    };
  }

  componentWillMount() {
    this.setState({
      files: this.props.files || [],
      link: null,
      preview: null
    });
  }

  componentDidMount() {
    if (document.getElementById("title")) {
      document.getElementById("title").value = this.props.title || "";
    }
    if (document.getElementById("text")) {
      document.getElementById("text").value = this.props.text || "";
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.workerManager);
  }

  onKeyPress(event, doGenPreview = false) {
    if (event.ctrlKey && event.key == "Enter") {
      this.sendMessage();
      return;
    }
    if (![" ", "Enter", "v"].includes(event.key)) {
      return;
    }
    if (doGenPreview) {
      this.genPreview(event.currentTarget);
    }
  }

  genPreview(t) {
    t.style.height = "1px";
    t.style.height = `${25 + t.scrollHeight  }px`;
    // waiting for the dom to be updated
    setTimeout(() => {
      const text = t.value;
      let links = text.match(/(https?:\/\/[^\s]+)/gi);
      if (links && links[0] != this.state.link) {
        http
          .get(`/api/links/by_url?url=${  encodeURIComponent(links[0])}`)
          .then(r => {
            if (r && t.value.indexOf(links[0]) >= 0) {
              this.setState({ link: links[0], preview: r });
            }
          });
      }
    }, 0);
  }

  // toggle state (removed or not) of a file
  toggleFile(fileIndex) {
    let files = this.state.files;
    let f = files.find(f => f.fileIndex == fileIndex);
    f.removed = !f.removed;
    this.setState({ files });
  }

  sendMessage() {
    if (this.props.messageId) {
      this.putMessage();
    } else {
      this.postMessage();
    }
  }

  putMessage() {
    let msg = {
      files: this.state.files
        .filter(e => !e.removed)
        .filter(e => e.status == "ready")
        .map(e => e["id"])
        .filter(e => !!e),
      data: {
        text: document.getElementById("text").value
      }
    };
    if (document.getElementById("title")) {
      msg.data.title = document.getElementById("title").value || "";
    }
    http.put(`/api/messages/${this.props.messageId}`, msg).then(res => {
      this.setState({sending: false});
      if (!res) {
        alert.add(lang.t("error_new_message"), "alert-danger");
        return;
      }
      window.dispatchEvent(new CustomEvent("editMessage", { detail: res }));
    });
    this.setState({sending: true});
  }

  postMessage() {
    let msg = {
      createdAt: Math.floor(Date.now() / 1000),
      author: me.me["id"],
      group: util.getId(this.props.group),
      children: [],
      files: this.state.files
        .filter(e => !e.removed)
        .filter(e => e.status == "ready")
        .map(e => e["id"])
        .filter(e => !!e),
      data: {
        text: (document.getElementById("text").value || "").substring(0, 50000)
      },
      lastActivityDate: Math.floor(Date.now() / 1000)
    };
    if (this.props.parent) {
      msg.parent = util.getId(this.props.parent);
    }
    if (document.getElementById("title")) {
      msg.data.title = document.getElementById("title").value || "";
    }
    // don't post if there is nothing to post
    if (!msg.files.length && !msg.data.text && !msg.data.title) {
      alert.add(lang.t("empty_message"), "alert-danger");
      return;
    }
    http.post("/api/messages", msg).then(res => {
      if (!res) {
        this.setState({ sending: false });
        alert.add(lang.t("error_new_message"), "alert-danger");
        return;
      }
      if (this.props.isChild) {
        this.setState({ sending: false });
        window.dispatchEvent(new CustomEvent("newChild", { detail: res }));
      } else {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("newParent", { detail: res }));
          router.navigate(router.toApp(`/messages/${res.id}`));
        }, 500);
      }
      this.setState({
        files: [],
        link: null,
        preview: null,
        writerId: util.genId(),
      });
      if (document.getElementById("text")) {
        document.getElementById("text").value = "";
      }
    });
    this.setState({ sending: true });
  }

  inputGenericFile(mimetype) {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.style.display = "none";
    input.type = "file";
    input.accept = mimetype;
    input.addEventListener("change", event => {
      this.addFile(event.target.files[0], mimetype);
    });
    input.click();
  }

  inputVideo() {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.style.display = "none";
    input.type = "file";
    input.accept = "video/*";
    input.addEventListener("change", event => {
      this.addFile(event.target.files[0], "video");
    });
    input.click();
  }

  inputImages() {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.style.display = "none";
    input.type = "file";
    input.multiple = "multiple";
    input.accept = "image/*";
    input.addEventListener("change", event => {
      let list = Array.from(event.target.files);
      list.map(e => this.addFile(e, "image"));
    });
    input.click();
  }

  addFile(inputFile, type) {
    this.setState(prevState => ({
      files: [...prevState.files, {
        inputFile,
        type,
        id: util.genId(),
        progress: 0,
        status: 'initial'
      }]
    }));
  }

  updateFile(id, file, callback = null) {
    this.setState(prevState => ({
      files: prevState.files.map(f => f.id === id ? Object.assign(f, file) : f)
    }), callback);
  }

  removeFile(id) {
    this.setState(prevState => ({
      files: prevState.files.filter(f => f.id != id)
    }));
  }

  manageWorkers() {
    if (this.state.workers.length >= navigator.hardwareConcurrency) {
      return;
    }
    let target = this.state.files.find(
      e => !this.state.workers.map(w => w.target?.id).includes(e.id) && e?.status == 'initial'
    );
    if (target) {
      let worker = {
        target,
        id: util.genId(),
      };
      this.setState(prevState => ({
        workers: [...prevState.workers, worker]
      }), () => this.addWorker(worker.id));
    }
  }

  removeWorker(workerId) {
    this.setState(prevState => ({
      workers: prevState.workers.filter(e => e.id != workerId)
    }));
  }

  addWorker(workerId) {
    let worker = this.state.workers.find(e => e.id == workerId);
    switch (worker.target.type) {
      case "image":
        import("/lazy/image-service.js").then(imageService => {
          imageService.default.handleImage(
            worker.target.inputFile,
            res => {
              this.updateFile(
                worker.target.id,
                {inputFile: res},
                this.uploadFile(worker.target.id, () => this.removeWorker(workerId))
              );
            }
          );
        });
        break;
      case "video":
        console.log(worker);
        this.uploadFile(worker.target.id, () => this.removeWorker(workerId));
        break;
      case "application/pdf":
        console.log(worker);
        this.uploadFile(worker.target.id, () => this.removeWorker(workerId));
        break;
      default:
        // don't know what to do
        // TODO handle this properly
        console.warn(worker.target);
        console.warn("unknown file type for worker");
    }
  }

  uploadFile(fileId, callback = null) {
    const formData = new FormData();
    let file = this.state.files.find(e => e.id == fileId);
    console.log(file);
    if (!file?.inputFile) {
      // TODO handle this properly
      console.error(this.state, file, fileId);
      throw "error";
    }
    formData.append("file", file.inputFile);
    formData.append("fileIndex", this.state.files.findIndex(f => f.id == file.id));

    // store current writerId for later comparison
    let writerId = this.state.writerId;

    http.sendFile(
      formData,
      file => {
        // update state only if it's the good writeId
        if (writerId == this.state.writerId) {
          file['status'] = 'ready';
          this.updateFile(fileId, file, callback);
        }
      },
      e => {
        this.updateFile(
          fileId,
          {progress: Math.floor((e.loaded / e.total) * 100)}
        )
      },
      e => {
        console.warn(e);
        alert.add(lang.t("error_upload"), "alert-danger");
        this.removeFile(fileId);
      }
    );
  }

  render() {
    if (this.state.sending) {
      return (
        <div class="message-placeholder">
          <div class="spinner orange-spinner">
            <div /><div /><div /><div /><div />
          </div>
        </div>
      );
    }
    return (
      <div class="writer">
        {!this.props.isChild && (
          <input
            type="text"
            id="title"
            onKeyPress={e => this.onKeyPress(e)}
            placeholder={lang.t("title_placeholder")}
           />
        )}
        <textarea
          onKeyPress={e => this.onKeyPress(e, true)}
          id="text"
          rows="5"
          autocomplete="off"
          autofocus={this.props.focus}
          placeholder={lang.t("text_placeholder")}
          maxlength="50000"
         />
        {this.state.preview && (
          <EmbedBlock inWriter={true} {...this.state.preview} />
        )}
        {!!this.state.files.length && (
          <FileGrid
            key={this.state.files.reduce(
              (a, c) => a + c.id + c.fileIndex + c.error,
              ""
            )}
            files={this.state.files}
            toggleFile={this.toggleFile}
            inWriter={true}
          />
        )}
        <div class="options">
          {api?.info?.upload?.image && (
            <button
              class="option"
              onClick={() => this.inputImages()}
              title={lang.t("upload_image")}
            >
              <FaIcon family={"regular"} icon={"images"} />
            </button>
          )}
          {api?.info?.upload?.video && (
            <button
              class="option"
              onClick={() => this.inputVideo()}
              title={lang.t("upload_video")}
            >
              <FaIcon family={"solid"} icon={"film"} />
            </button>
          )}
          {api?.info?.upload?.pdf && (
            <button
              class="option"
              onClick={() => this.inputGenericFile("application/pdf")}
              title={lang.t("upload_pdf")}
            >
              <FaIcon family={"regular"} icon={"file-pdf"} />
            </button>
          )}
          <div class="actions">
            {this.props.cancel && (
              <button class="cancel" onClick={e => this.props.cancel(e)}>
                {lang.t("cancel")}
              </button>
            )}
            <button
              disabled={!this.props.group}
              type="submit"
              class="submit"
              onClick={e => this.sendMessage(e)}
            >
              {lang.t("submit")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
