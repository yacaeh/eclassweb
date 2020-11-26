class PointerSaver {
    constructor() {
        this.container = {};
        this.nowIdx = 0;
        this.path = undefined;
    }

    async load_container(path) {
        console.warn("LOAD");
        if (this.path) {
            this.save_container();
        }
        this.nowIdx = 0;
        this.path = path;
        let json = path + "_" + connection.extra.userFullName + ".json";
        try{
            const ret = await axios.get(json);
            const data = ret.data;
            
            if (Object.keys(data).length == 0) {
                throw("no data");
            }

            pointer_saver.container = data;
            window.currentPoints = data[0].points;
            window.currentHistory = data[0].history;
            data[0].command = "my";
            designer.syncData(data[0]);
            designer.sync();
        }
        catch(e){
            pointer_saver.container = {};
            canvasManager.clear();
            designer.sync();
            return;
        }
    }
    save_container() {
        this.save();
        axios.post(fileServerUrl + '/point', {
            filepath: this.path,
            userId: connection.extra.userFullName,
            point: this.container
        })
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

        classroomInfo.permissions.canvasPermission.forEach((id) => {
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