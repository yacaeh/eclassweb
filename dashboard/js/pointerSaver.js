class PointerSaver {
    constructor(){
        this.container = {};
        this.nowIdx = 0;
        this.path = undefined;
    }

    load_container(path){
        if(this.path){
            this.save_container();
        }
        this.nowIdx = 0;
        this.path = path;
        let json =  path + "_" + connection.extra.userFullName + ".json";
        Get(json,function(e){
            let data = JSON.parse(e);
            pointer_saver.container = data;
            window.currentPoints = data[0].points;
            window.currentHistory = data[0].history;
            data[0].command = "my";
            
            designer.syncData(data[0]);
            designer.sync();

            console.log("loaded container",path,name,data);
        })
    }
    save_container(){
        this.save();
        let url = uploadServerUrl + '/point';
        let name = connection.extra.userFullName;
        let data = {
            filepath : this.path,
            userId   : name,
            point    : this.container
        }
        Post(url,JSON.stringify(data),function(e){
            console.log(e);
        })

        console.log("save container",this.path,name,this.container)
        console.log(JSON.stringify(data).length);
        this.path = undefined;
    }
    save(){
        var point, history;

        if(typeof window.currentPoints == "undefined")
            return;
        else 
            point =  JSON.parse(JSON.stringify( window.currentPoints ))

        if(typeof window.currentHistory == "undefined")
            history = [];
        else 
            history = JSON.parse(JSON.stringify( window.currentHistory ))

        this.container[this.nowIdx] = {
            points :  point,
            history : history,
        }
        window.currentPoints = undefined;
        window.currentHistory = undefined;

        this.show();
    }
    show(){
        console.debug(this.container);
    }
    load(idx){
        this.nowIdx = idx;
        CanvasManager.clear();

        this.get();

        if(this.container[idx]){
            this.container[idx].command = "my";

            window.currentPoints = this.container[idx].points;
            window.currentHistory = this.container[idx].history;

            if(this.container[idx].history.length == 0){
                console.log("NO DATA")
                return null;
            }

            designer.syncData(this.container[idx]);
        }
        else{
            console.log("There is no data");
        }

    }
    empty(){
        this.container = {};
        this.nowIdx = 0;
    }
    get(){
        connection.send({
            getpointer: true ,
            idx : this.nowIdx
        });
    }
    send(idx){
    if(!(connection.extra.roomOwner || 
        permissionManager.IsCanvasPermission(connection.userid))){
        return;
    }
    
    if(idx == this.nowIdx)
    this.save(idx);

        if(this.container[idx])
            connection.send({
                setpointer: true,
                idx : idx,
                data : this.container[idx],
            })
        else{
            connection.send({
                setpointer: true,
                idx : "empty"
            })
        }
    }
    close(){
        this.save(this.nowIdx);
    }
}