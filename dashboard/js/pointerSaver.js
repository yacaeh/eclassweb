PointerSaver = {
    container : {},
    nowIdx : 0,

    save : function(){
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
    },
    show : function(){
        console.log(this.container);
    },
    load : function(idx){
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

    },
    empty : function(){
        this.container = {};
        this.nowIdx = 0;
    },
    get : function(){
        connection.send({
            getpointer: true ,
            idx : this.nowIdx
        });
    },
    send : function(idx){
    if(!(connection.extra.roomOwner || connection.userid == classroomInfo.canvasPermission)){
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
    },
    close : function(){
        this.save(this.nowIdx);
    }
}

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
  
function ClearStudentCanvas(){
    designer.syncData({
        command : "clearstudent",
        isStudent : true,
        uid: connection.userid,
      })
}

function SendStudentPointData(){
    connection.send({

    })

    designer.syncData({
        command : "default",
        isStudent : true,
        points : currentPoints ,
        history : currentHistory,
        uid: connection.userid,
      })
}

