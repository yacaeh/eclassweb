class PointerSaver {
    constructor(){
        this.container = {};
        this.nowIdx = 0;
    }

    load_container(path){
        var name = connection.extra.userFullName;
        console.log("load container",path,name);
    }
    save_container(path){
        var name = connection.extra.userFullName;
        console.log("save container",path,name,this.container)
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
        console.log(this.container);
    }
    load(idx){
        this.nowIdx = idx;
        ClearCanvas();
        ClearTeacherCanvas();
        ClearStudentCanvas();

        this.get();

        if(this.container[idx]){
            this.container[idx].command = "my";

            window.currentPoints = this.container[idx].points;
            window.currentHistory = this.container[idx].history;

            console.log(this.container[idx].history.length)
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

var pointer_saver = new PointerSaver();

function ClearTeacherCanvas(){
  designer.syncData({
    command : "clearteacher",
    uid: connection.userid,
  })
}

function ClearCanvas() {
designer.syncData({
    command : "clearcanvas",
    uid: connection.userid,
    })
}
  
function ClearStudentCanvas(studentid){
    designer.syncData({
        command : "clearstudent",
        isStudent : true,
        userid: studentid,
    })
}

function SendStudentPointData(){
    designer.syncData({
        command : "default",
        isStudent : true,
        points : currentPoints ,
        history : currentHistory,
        uid: connection.userid,
      })
}

