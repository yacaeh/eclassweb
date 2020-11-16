class FileViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowShow: "files",
            data: [],
            curentData: [],
            showUploadModal: true,
        }

        this.onClickHeader = this.onClickHeader.bind(this);
        this.ViewUploadList = this.ViewUploadList.bind(this);
        this.fileFilter = this.fileFilter.bind(this);
        this.Header = this.Header.bind(this);
    }

    componentDidMount(){
        var lang = language;
        if (lang == 'ko') { 
            lang = 'kr'; 
        }
        let extraPath = "";
        
        $("#file-explorer").fileinput({
            'theme': 'explorer-fas',
            'language': lang,
            'uploadUrl': fileServerUrl + '/upload',
            fileActionSettings: {
                showZoom: false,
            },
            overwriteInitial: false,
            initialPreviewAsData: true,
            preferIconicPreview: true, // this will force thumbnails to display icons for following file extensions
            previewFileIconSettings: { // configure your icon file extensions
                'doc': '<i class="fas fa-file-word text-primary"></i>',
                'xls': '<i class="fas fa-file-excel text-success"></i>',
                'ppt': '<i class="fas fa-file-powerpoint text-danger"></i>',
                'pdf': '<i class="fas fa-file-pdf text-danger"></i>',
                'zip': '<i class="fas fa-file-archive text-muted"></i>',
                'htm': '<i class="fas fa-file-code text-info"></i>',
                'txt': '<i class="fas fa-file-text text-info"></i>',
                'mov': '<i class="fas fa-file-video text-warning"></i>',
                'mp3': '<i class="fas fa-file-audio text-warning"></i>',
                'jpg': '<i class="fas fa-file-image text-danger"></i>',
                'gif': '<i class="fas fa-file-image text-muted"></i>',
                'png': '<i class="fas fa-file-image text-primary"></i>'
            },
            previewFileExtSettings: { // configure the logic for determining icon file extensions
                'doc': function (ext) {
                    return ext.match(/(doc|docx)$/i);
                },
                'xls': function (ext) {
                    return ext.match(/(xls|xlsx)$/i);
                },
                'ppt': function (ext) {
                    return ext.match(/(ppt|pptx)$/i);
                },
                'zip': function (ext) {
                    return ext.match(/(zip|rar|tar|gzip|gz|7z)$/i);
                },
                'htm': function (ext) {
                    return ext.match(/(htm|html)$/i);
                },
                'txt': function (ext) {
                    return ext.match(/(txt|ini|csv|java|php|js|css)$/i);
                },
                'mov': function (ext) {
                    return ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i);
                },
                'mp3': function (ext) {
                    return ext.match(/(mp3|wav)$/i);
                }
            },
            uploadExtraData: {
                // userId: path
                userId: params.sessionid,
                extraPath: extraPath,
            },

        }).on('fileuploaded', function (event, previewId, index, fileId) {
            console.error('File Uploaded', 'ID: ' + fileId + ', Thumb ID: ' + previewId);
            console.log(previewId.response);
            if (connection.extra.roomOwner)
                getUploadFileList();
        }).on('fileuploaderror', function (event, data, msg) {
            console.log('File Upload Error', 'ID: ' + data.fileId + ', Thumb ID: ' + data.previewId);
        }).on('filebatchuploadcomplete', function (event, preview, config, tags, extraData) {
            console.log('File Batch Uploaded', preview, config, tags, extraData);
        });
    }

    render() {
        return <div id="confirm-box" className="modal fade">
            <button id='refresh' onClick={() => this.ViewUploadList('')}></button>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <this.Header selected={this.state.nowShow} onClick={this.onClickHeader} />
                    <div id="confirm-message" className="modal-body">
                        <FileList data={this.state.curentData} />
                        <this.UploadModal show={this.state.showUploadModal}/>
                    </div>
                    <this.Footer close={this.closeWindow} />
                </div>
            </div>
        </div>
    }

    UploadModal(props) {
        return <form style={{
            display : props.show ? 'block' : 'none'
        }} name="upload" method="POST" encType="multipart/form-data" action="/upload/">
            <input id="file-explorer" type="file" multiple accept=".gif,.pdf,.odt,.png,.jpg,.jpeg,.mp4,.webm" />
        </form>
    }

    Header(props) {
        return <div className="modal-header">
            <h5 className={"fileViewer_Btn " + (props.selected == 'files' ? "selected" : '')} id="confirm-title" data-id='files' onClick={props.onClick}></h5>
            <h5 className={"fileViewer_Btn " + (props.selected == 'epub' ? "selected" : '')} id="confirm-title3" data-id='epub' onClick={props.onClick}>E-pub</h5>
            <h5 className={"fileViewer_Btn " + (props.selected == '3d' ? "selected" : '')} id="confirm-title4" data-id='3d' onClick={props.onClick}>3D</h5>
            <h5 className={"fileViewer_Btn " + (props.selected == 'pdf' ? "selected" : '')} id="confirm-title5" data-id='pdf' onClick={props.onClick}>PDF</h5>
            <h5 className={"fileViewer_Btn " + (props.selected == 'homework' ? "selected" : '')} id="confirm-title2" data-id='homework' onClick={props.onClick}></h5>
            <button onClick={props.close} type="button" className="close btn-confirm-close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    }

    closeWindow(e) {
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
    }

    onClickHeader(e) {
        let id = e.target.dataset.id;

        this.setState({
            nowShow: id
        })

        switch (id) {
            case "homework":
                this.setState({showUploadModal : false})
                // this.ViewUploadList('/homework');
                break;
            default:
                this.setState({showUploadModal : true})
                this.fileFilter(id);
                break;
        }
    }

    fileFilter(filter) {
        switch (filter) {
            case 'files':
                this.setState({ curentData: this.state.data });
                break;
            case 'pdf':
                this.setState({ curentData: this.state.data.filter(x => { if (x.type == 'pdf') return x }) })
                break;
            default:
                this.setState({ curentData: this.state.data });
                break;

        }
        console.log(filter);
    }

    async ViewUploadList(path) {
        if (!connection.extra.roomOwner)
            return;
        let data = await getUploadFileList(path);
        var re = /(?:\.([^.]+))?$/;

        data = data.files.filter((file) => {
            if (!(file.name == "homework" || re.exec(file.name)[1] == "json" || !re.exec(file.name)[1])) {
                let type = re.exec(file.name);
                type = type[type.length - 1];
                file.type = type;
                return file;
            }
        })
        this.setState({ data: data });
        this.setState({ curentData: data });
    };

    Footer(props) {
        return <> <div className="modal-footer">
            <button onClick={unloadFileViewer} className="btn btn-danger" id="btn-confirm-file-close" />
            <button onClick={props.close} className="btn btn-primary" id="btn-confirm-action" />
        </div>
        </>

    }

}

function FileList(props) {
    function Content(props) {
        function getFileType(ext) {
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

        var re = /(?:\.([^.]+))?$/;
        return <li className="list-group-item">
            <p className="mb-0">
                <span className="file-other-icon"> {getFileType(re.exec(props.name)[1])} </span>
                <label>{props.name}</label>
                <button type="button" className="btn btn-primary btn-lg pull-right float-right" onClick={() => { loadFileViewer(props.url) }}><i className="fa fa-folder float-right" /></button>
                <button type="button" className="btn btn-danger btn-lg pull-right float-right" onClick={() => { deleteUploadedFile(props.name, '') }}><i className="fa fa-trash float-right" /></button>
            </p>
        </li>
    }

    const fileList = props.data.map(val => <Content name={val.name} url={val.url} key={val.name} />);
    return <ul className='list-group-flush'>
        {fileList}
    </ul>
}
