class logManagerClass{
    getCurrentTime(){
        let time = new Date();
        let y = time.getFullYear();
        let m = time.getMonth() + 1;
        let d = time.getDate();
        let h = time.getHours();
        let min = time.getMinutes();
        return y + '-' + m  + '-' + d + ' ' + h + ':' + min;
    };

    createClass(){
        console.debug("Create Class", this.createData(this.getCurrentTime()));
        connection.socket.emit('log-create-class',this.createData(this.getCurrentTime()));
    };

    joinStudent(userid){
        console.debug("Join Student");
        connection.socket.emit('log-join-student',this.createData(this.getCurrentTime(), userid));
    };

    leftStudent(){
        console.debug("Left Student");
    };

    leftClass(){
        console.debug("Left Class");
    };

    showClassStatus(){
        connection.socket.emit('show-class-status', (e) => console.log(e));
    }
    
    createData(time, userid){
        return {
            time : time,
            userid : userid || connection.userid,
            username : connection.extra.userFullName
        }
    }
}

var logManager          = new logManagerClass();