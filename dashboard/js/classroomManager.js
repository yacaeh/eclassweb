class classRoomManagerClass {
    callTeacher() {
        connection.send({
            callTeacher: {
                userid: connection.userid
            }
        }, GetOwnerId());
    }
}