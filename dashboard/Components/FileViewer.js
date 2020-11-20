class FileViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowPath         : undefined,
            nowType         : undefined,
            epubdata        : [],
            nowShow         : "files",
            data            : [],
            currentData      : [],
            showUploadModal : true,
            isFileViewer    : false,
            EpubManager     : new epubManagerClass()
        }

        this.onHeaderClickHeader = this.onHeaderClickHeader.bind(this);
        this.fileFilter = this.fileFilter.bind(this);
        this.Header = this.Header.bind(this);
        this.updateFileList = this.updateFileList.bind(this);
        this.loadFileViewer = this.loadFileViewer.bind(this);
        this.unloadFileViewer = this.unloadFileViewer.bind(this);
        this.Footer = this.Footer.bind(this);
    }

    componentDidMount() {
        let _this = this;
        let extraPath = window.params.open === 'true' ? '' : '/homework';
        
        axios.get(fileServerUrl + '/epub-list').then((epublist) =>{

            epublist.data.files.map(async (e) => {
                e.url += '/ops/content.opf'; 
                var book = await ePub(e.url);
                let zz = await book.loaded.metadata;
                e.name = zz.description;
                return e
            })
            this.setState({ epubdata: epublist.data.files });
        })


        $("#file-explorer").fileinput({
            'theme': 'explorer-fas',
            uploadUrl : fileServerUrl + '/upload',
            fileActionSettings: {
                showZoom: false,
            },
            overwriteInitial: false,
            initialPreviewAsData: true,
            preferIconicPreview: true, // this will force thumbnails to display icons for following file extensions
            uploadExtraData: {
                userId: params.sessionid,
                extraPath
            },

        }).on('fileuploaded', function (event, previewId, index, fileId) {
            console.error('File Uploaded', 'ID: ' + fileId + ', Thumb ID: ' + previewId);
            console.log(previewId.response);
            if (connection.extra.roomOwner) {
                _this.updateFileList();
            }
        }).on('fileuploaderror', function (event, data, msg) {
            console.log('File Upload Error', 'ID: ' + data.fileId + ', Thumb ID: ' + data.previewId);
        }).on('filebatchuploadcomplete', function (event, preview, config, tags, extraData) {
            console.log('File Batch Uploaded', preview, config, tags, extraData);
        });

        _this.updateFileList();
    }

    render() {
        return <div id="confirm-box" className="modal fade">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <this.Header selected={this.state.nowShow} onClick={this.onHeaderClickHeader} />
                    <div id="confirm-message" className="modal-body">
                        <FileList
                            nowShow={this.state.nowShow}
                            getlist={this.updateFileList}
                            loadFileViewer={this.loadFileViewer}
                            nowPath={this.state.nowPath}
                            data={this.state.currentData} />
                        <this.UploadModal show={this.state.showUploadModal} />
                    </div>
                    <this.Footer />
                </div>
            </div>
        </div>
    }

    // Components ==========================================

    Footer() {
        return <> <div className="modal-footer">
            <button style={this.state.isFileViewer ? {display : "block"} :  {display : "none"}} onClick={this.unloadFileViewer} className="btn btn-danger" id="btn-confirm-file-close">{GetLang('CLOSE_CURRENT_FILE')}</button>
            <button onClick={this.closeWindow} className="btn btn-primary" id="btn-confirm-action">{GetLang('OK')}</button>
        </div>
        </>
    };

    UploadModal(props) {
        return <form style={{
            display: props.show ? 'block' : 'none'
        }} name="upload" method="POST" encType="multipart/form-data" action="/upload/">
            <input id="file-explorer" type="file" multiple accept=".gif,.pdf,.odt,.png,.jpg,.jpeg,.mp4,.webm" />
        </form>
    };

    Header(props) {
        return <div className="modal-header">
            <h5 className={"fileViewer_Btn " + (props.selected == 'files' ? "selected" : '')} id="confirm-title" data-id='files' onClick={props.onClick}>{GetLang('FILE_MANAGER')}</h5>
            <h5 className={"fileViewer_Btn " + (props.selected == 'epub' ? "selected" : '')} id="confirm-title3" data-id='epub' onClick={props.onClick}>E-pub</h5>
            <h5 className={"fileViewer_Btn " + (props.selected == 'pdf' ? "selected" : '')} id="confirm-title5" data-id='pdf' onClick={props.onClick}>PDF</h5>
            {/* <h5 className={"fileViewer_Btn " + (props.selected == '3d' ? "selected" : '')} id="confirm-title4" data-id='3d' onClick={props.onClick}>3D</h5> */}
            <h5 className={"fileViewer_Btn " + (props.selected == 'homework' ? "selected" : '')} id="confirm-title2" data-id='homework' onClick={props.onClick}>{GetLang('ASSIGNMENT')}</h5>
            <button onClick={props.close} type="button" className="close btn-confirm-close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    };

    // ============================================================================

    closeWindow() {
        $('#confirm-box').modal('hide');
    };

    async onHeaderClickHeader(e) {
        let id = e.target.dataset.id;

        this.setState({
            nowShow: id
        })

        switch (id) {
            case "homework":
                let data = { "userId": params.sessionid, "extraPath": '/homework' };
                let homework = await axios.post(fileServerUrl + '/list', data);
                this.setState({ currentData: this.dataConverter(homework) });
                this.setState({ showUploadModal: false })
                break;
            case "epub":
                this.setState({ currentData: this.state.epubdata });
                this.setState({ showUploadModal: false })
                break;
            default:
                this.setState({ showUploadModal: true })
                this.fileFilter(id);
                break;
        }
    };

    async updateFileList(extraPath) {
        extraPath = extraPath || '';
        let data = { "userId": params.sessionid, extraPath: ''};
        let ret = await axios.post(fileServerUrl + '/list', data);
        let retdata = this.dataConverter(ret)

        this.setState({ data: retdata });

        if(extraPath){
            data.extraPath = extraPath;
            let ret = await axios.post(fileServerUrl + '/list', data);
            this.setState({ currentData: this.dataConverter(ret)});
        }
        else{
            this.setState({ currentData: retdata });
        }

        return;
    };

    dataConverter(data){
        var re = /(?:\.([^.]+))?$/;
        return data.data.files.filter((file) => {
            if (!(file.name == "homework" || re.exec(file.name)[1] == "json" || !re.exec(file.name)[1])) {
                let type = re.exec(file.name);
                type = type[type.length - 1];
                file.type = type;
                return file;
            }
        })
    }

    fileFilter(filter) {
        switch (filter) {
            case 'files':
                this.setState({ currentData: this.state.data });
                break;
            case 'pdf':
                this.setState({ currentData: this.state.data.filter(x => { if (x.type == 'pdf') return x }) })
                break;
            default:
                this.setState({ currentData: this.state.data });
                break;

        }
        console.log(filter);
    };

    unloadFileViewer() {
        console.log("UNLOAD FILEVIEWER");
        canvasManager.clear();
        pointer_saver.save();
        pageNavigator.off();

        var btn = document.getElementById("file");
        btn.classList.remove("selected-shape");
        btn.classList.remove("on");
        
        if(classroomInfo.viewer.state)
                mfileViewer.closeFile();



        if(classroomInfo.epub.state){
            classroomCommand.sendCloseEpub();       
            epubManager.unloadEpubViewer();
        }
            

        isSharingFile = false;
        this.setState({
            isFileViewer : false, 
            isSharingFile : false,
            nowPath : undefined,
            nowType : undefined
        });
    };

    loadFileViewer(path, type) {
        if (this.state.nowPath == path) {
            alert(window.langlist.SAME_FILE_OPEN_ERROR);
            return;
        }

        var btn = document.getElementById("file");
        btn.classList.add("selected-shape");
        btn.classList.add("on");
        isSharingFile = true;

        if(classroomInfo.epub.state){
            classroomCommand.sendCloseEpub();
            epubManager.unloadEpubViewer();
        }

        if(classroomInfo.viewer.state)
            mfileViewer.closeFile();



        if (type != 'epub') {
            mfileViewer.openFile(path);
        }
        else {
            pageNavigator.removethumbnail();
            this.closeWindow();
            epubManager.loadEpubViewer(path);
            classroomCommand.sendOpenEpub(path);
        }

        
        this.setState({
            isFileViewer : true, 
            isSharingFile : true, 
            nowPath: path ,
            nowType : type
        });

    };
}


class FileList extends React.Component {
    constructor(props) {
        super(props);
        this.Content = this.Content.bind(this);
        this.deleteUploadedFile = this.deleteUploadedFile.bind(this);
    }

    render() {
        const fileList = this.props.data.map(val =>
            <this.Content
                nowShow={this.props.nowShow}
                loadFileViewer={this.props.loadFileViewer}
                data={val}
                key={val.name} />);
        return <ul className='list-group-flush'>
            {fileList}
        </ul>
    }

    getFileType(ext) {
        if (ext === undefined) {
            return <i className="fas fa-folder text-primary" />;
        }
        else if (ext.match(/(doc|docx)$/i)) {
            return <i className="fas fa-file-word text-primary" />;
        }
        else if (ext.match(/(xls|xlsx)$/i)) {
            return <i className="fas fa-file-excel text-success" />;
        }
        else if (ext.match(/(ppt|pptx)$/i)) {
            return <i className="fas fa-file-powerpoint text-danger" />;
        }
        else if (ext.match(/(pdf)$/i)) {
            return <i className="fas fa-file-pdf text-danger" />;
        }
        else if (ext.match(/(zip|rar|tar|gzip|gz|7z)$/i)) {
            return <i className="fas fa-file-archive text-muted" />;
        }
        else if (ext.match(/(htm|html)$/i)) {
            return <i className="fas fa-file-code text-info" />;
        }
        else if (ext.match(/(txt|ini|csv|java|php|js|css)$/i)) {
            return <i className="fas fa-file-code text-info" />;
        }
        else if (ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i)) {
            return <i className="fas fa-file-video text-warning" />;
        }
        else if (ext.match(/(mp3|wav)$/i)) {
            return <i className="fas fa-file-audio text-warning" />;
        }
        else if (ext.match(/(jpg)$/i)) {
            return <i className="fas fa-file-image text-danger" />;
        }
        else if (ext.match(/(gif)$/i)) {
            return <i className="fas fa-file-image text-muted" />;
        }
        else if (ext.match(/(png)$/i)) {
            return <i className="fas fa-file-image text-primary" />;
        }
        else {
            return <i className="fas fa-file text-muted" />;
        }
    }

    async deleteUploadedFile(filename, extraPath) {
        if (this.props.nowPath) {
            var nowName = this.props.nowPath.split('/');
            nowName = nowName[nowName.length - 1];
            if (filename == nowName) {
                alert(window.langlist.DELETE_OPEN_ERROR);
                return;
            }
        }

        let data = {
            "userId": params.sessionid,
            "name": filename,
            "extraPath": extraPath
        };
        let ret = await axios.post(fileServerUrl + '/delete', data);
        if (ret.status == 200) {
            this.props.getlist(extraPath);
        }
    }

    downloadUploadedFile(url, name) {
        fetch(url)
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => alert('oh no!'));
    }

    Content(props) {
        var re = /(?:\.([^.]+))?$/;
        return <li className="list-group-item">
            <p className="mb-0">
                <span className="file-other-icon"> {this.getFileType(re.exec(props.data.name)[1])} </span>
                <label>{props.data.name}</label>

                {
                    this.props.nowShow == 'homework' && 
                    <button type="button" className="btn btn-safe btn-lg pull-right float-right" 
                        onClick={() => {this.downloadUploadedFile(props.data.url + '/' , props.data.name)}}>
                         <i className="fa fa-download float-right" />
                    </button>
                }

                <button type="button" className="btn btn-primary btn-lg pull-right float-right"
                    onClick={() => { props.loadFileViewer(props.data.url, props.data.type) }}>
                    <i className="fa fa-folder float-right" /></button>

                {props.data.type != "epub" &&
                    <button type="button" className="btn btn-danger btn-lg pull-right float-right"
                        onClick={() => { this.deleteUploadedFile(props.data.name, this.props.nowShow == 'homework' ? '/homework' : '') }}>
                        <i className="fa fa-trash float-right" /></button>
                }
            </p>
        </li>
    }
}