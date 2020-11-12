class FileViewer extends React.Component {
    render() {
        return <div id="confirm-box" className="modal fade">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="confirm-title" onClick={this.ViewUploadList}></h5>
                        <h5 className="modal-title" id="confirm-title2" onClick={this.ViewHomeworkList}></h5>
                        <button type="button" className="close btn-confirm-close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div id="confirm-message" className="modal-body" />
                    <this.Footer />
                </div>
            </div>
        </div>
    }

    ViewUploadList(e) {
        if (!connection.extra.roomOwner)
            return;

        e.target.classList.add("selected");
        document.getElementById("confirm-title2").classList.remove("selected");
        $("form[name=upload]").show();
        getUploadFileList();
    };

    ViewHomeworkList(e) {
        e.target.classList.add("selected");
        document.getElementById("confirm-title").classList.remove("selected");
        $("form[name=upload]").hide();
        getUploadFileList("/homework");
    };

    Footer() {
        function Close() {
            return <button className="btn btn-danger" id="btn-confirm-file-close">현재 파일 닫기</button>
        }

        function Cancle() {
            return <button className="btn btn-confirm-close" id="btn-confirm-close">취소</button>;
        };

        function Submit() {
            return <button className="btn btn-primary" id="btn-confirm-action">확인</button>;
        }

        return <> <div className="modal-footer">
            <Close />
            <Cancle />
            <Submit />
            </div>
        </>

    }

}