PointerSaver = {
    container : {},
    nowIdx : 0,

    save : function(idx){
        var point, history;

        if(typeof window.currentPoints == "undefined")
            return;
        else 
            point =  JSON.parse(JSON.stringify( window.currentPoints ))

        if(typeof window.currentHistory == "undefined")
            history = [];
        else 
            history = JSON.parse(JSON.stringify( window.currentHistory ))

        this.container[idx] = {
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

        if(this.container[idx]){
            this.container[idx].command = "loaddata";

            window.currentPoints = this.container[idx].points;
            window.currentHistory = this.container[idx].history;

            console.log(this.container[idx].history.length)
            if(this.container[idx].history.length == 0){
                console.log("NO DATA")
                return null;
            }

            console.log(this.container[idx]);
            designer.syncData(this.container[idx]);
        }
        else{
            console.log("There is no data");
        }
    },
    empty : function(){
        this.container = {};
        nowIdx = 0;
    },
    get : function(idx){
        connection.send({
            getpointer: true ,
            idx : idx
        });
    },
    send : function(idx){
    if(!connection.extra.roomOwner){
        return;
    }
    if(idx == this.nowIdx)
    this.save(idx);

        if(this.container[idx])
            connection.send({
                setpointer: true,
                idx : this.container[idx]
            })
        else{
            connection.send({
                setpointer: true,
                idx : "empty"
            })
        }
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
  