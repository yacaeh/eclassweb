/*
    학생들의 행동에 대한 정보를 저장.
    ex) pdf view에서 몇페이지를 보고 있는지 등
*/
classroomStudentsWatchInfo = { 
    
    students : {},
    onPdfPage : function(student) {},       // pdf page 호출 되는 이벤트
    onEpubPage : function(student) {},  



    setPdfPage : function (_userid, _page) {
        var student = this.getStudent (_userid);
        student.pdfViewPage = _page;

        this.onPdfPage (student);
    },

    setEpubPage : function (_userid, _page) {
        var student = this.getStudent (_userid);
        student.epubViewPage = _page;

        onEpubPage (student);
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
        if(null == this.students[_userid]) {
            var student = {
                userid : _userid,
            }
            this.students[_userid] = student;
        }
        return this.students[_userid];
    },


    // 방에서 학생이 나가면 삭제를 해야 한다.
    removeStudent : function (_userid) {

    },

};





