class PointerSaver {
    constructor() {
        this.container = {};
        this.nowIdx = 0;
        this.path = undefined;
    }

    async load_container(path) {
        if (this.path) {
            this.save_container();
        }
        this.nowIdx = 0;
        this.path = path;
        let json = path + "_" + connection.extra.userFullName + ".json";
        try{
            let ret = await axios.get(json);
            let data = ret.data;
            if (data == 404 || Object.keys(data).length == 0) {
                pointer_saver.container = {};
                canvasManager.clear();
                designer.sync();
                return;
            }
            pointer_saver.container = data;
            window.currentPoints = data[0].points;
            window.currentHistory = data[0].history;
            data[0].command = "my";
            designer.syncData(data[0]);
            designer.sync();
        }
        catch(e){

        }
    }
    save_container() {
        this.save();
        let url = fileServerUrl + '/point';
        let name = connection.extra.userFullName;
        let data = {
            filepath: this.path,
            userId: name,
            point: this.container
        }
        axios.post(url, data)
        this.path = undefined;
    }
    save() {
        var point, history;

        if (typeof window.currentPoints == "undefined")
            return;
        else
            point = JSON.parse(JSON.stringify(window.currentPoints))

        if (typeof window.currentHistory == "undefined")
            history = [];
        else
            history = JSON.parse(JSON.stringify(window.currentHistory))

        this.container[this.nowIdx] = {
            points: point,
            history: history,
        }
        window.currentPoints = undefined;
        window.currentHistory = undefined;

        this.show();
    }
    show() {
        if (debug)
            console.debug(this.container);
    }
    load(idx) {
        this.nowIdx = idx;
        canvasManager.clear();

        this.get();

        if (this.container[idx]) {
            this.container[idx].command = "my";

            window.currentPoints = this.container[idx].points;
            window.currentHistory = this.container[idx].history;

            if (this.container[idx].history.length == 0) {
                return null;
            }

            designer.syncData(this.container[idx]);
        }
        else {
        }

    }
    empty() {
        this.container = {};
        this.nowIdx = 0;
    }
    get() {

        classroomInfo.canvasPermission.forEach((id) => {
            connection.send({
                getpointer: true,
                idx: this.nowIdx
            },id);
        });

        if(!connection.extra.roomOwner)
            connection.send({
                getpointer: true,
                idx: this.nowIdx
            },GetOwnerId());
    }
    send(idx) {
        if (!(connection.extra.roomOwner ||
            permissionManager.IsCanvasPermission(connection.userid))) {
            return;
        }

        if (idx == this.nowIdx)
            this.save(idx);

        if (this.container[idx]){
            connection.send({
                setpointer: true,
                idx: idx,
                data: this.container[idx],
            })
        }
        else {
            connection.send({
                setpointer: true,
                idx: "empty"
            })
        }
    }
    close() {
        this.save(this.nowIdx);
    }
}