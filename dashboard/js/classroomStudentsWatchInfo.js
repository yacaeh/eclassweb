/*
    학생들의 행동에 대한 정보를 저장.
    ex) pdf view에서 몇페이지를 보고 있는지 등
*/
classroomStudentsWatchInfo = { 
    
    students = {},


    setPdfPage : function (_userid, _page) {
        let student = this.getStudent (_userid);
        student.pdfViewPage = _page;
    },

    setEpubPage : function (_userid, _page) {
        let student = this.getStudent (_userid);
        student.epubViewPage = _page;
    },
    
    getPdfPage : function (_userid) {
        // if(!this.getStudent(_userid).pdfViewPage)            
        //     this.setPdfPage (_userid, -1);
        return this.getStudent(_userid).pdfViewPage;
    },
    
    getEpubPage : function (_userid) {
        return this.getStudent(_userid).epubViewPage;
    },    

    getStudent : function (_userid) {
        if(null != students[_userid]) {
            let student = {
                userid : _userid,
            }
            this.students[_userid] = student;
        }
        return students[_userid];
    },

    removeStudent : function (_userid) {

    },

};





