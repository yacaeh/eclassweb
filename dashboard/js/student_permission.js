/////////////////////////////////////
// 학생 권한 ////////////////////////
/////////////////////////////////////

var nowSelectStudent = undefined;

permissionManager = {
  setClassPermission: function (id) {
    if (connection.userid == id) {
      console.log("GET CLASS PERMISSION");
      document.getElementById("class_permission").innerHTML = "수업 권한";
      window.permission = true;
    }
  },

  setMicPermission: function (id) {
    if (connection.userid == id) {
      console.log("GET MIC PERMISSION");
      document.getElementById("mic_permission").innerHTML = "마이크 권한";
    }
    else {
      this.unmute();
    }
  },

  setCanvasPermission : function(id){
    if(connection.userid == id){
      console.log("GET CANVAS PERMISSION");
      connection.send({sendStudentPoint : true,
        isStudent : true,
        points : currentPoints ,
        history : currentHistory,
        uid: connection.userid,
      })
    }
  },
  disableCanvasPermission : function(id){
    console.log("LOST CANVAS PERMISSION");
    ClearStudentCanvas();
  },

  disableClassPermission: function () {
    if (window.permission) {
      console.log("LOST CLASS PERMISSION");
      document.getElementById("class_permission").innerHTML = "";

      if (classroomInfoLocal.shareScreen.state) {
        isSharingScreen = false;
        if (typeof (lastStream) !== "undefined")
          lastStream.getTracks().forEach((track) => track.stop());
        return false;
      }
      window.permission = false;
    }
  },

  disableMicPermission: function () {
    console.log("LOST MIC PERMISSION");
    document.getElementById("mic_permission").innerHTML = "";
    this.mute();
  },

  mute: function () {
    connection.streamEvents.selectAll().forEach(function (e) {
      if(e.stream.isVideo && !e.extra.roomOwner && e.userid != classroomInfo.micPermission){
        e.mediaElement.volume = 0;
      }
    })

    if(connection.extra.roomOwner){
      connection.send({mute : true});
    }
  },

  unmute: function (id) {
    connection.streamEvents.selectAll().forEach(function (e) {
      if(e.stream.isVideo && 
        e.userid == id && 
        !e.extra.roomOwner){
        e.mediaElement.volume = 1;
      }
    })

    if(connection.extra.roomOwner){
      connection.send({unmute : id});
    }
  }
}

function OnClickStudent(div) {
  div.click(function (e) {
    var menu = document.getElementById('student-menu');
    nowSelectStudent = e.target;

    var name = e.target.dataset.name;
    var pid = e.target.dataset.id;

    SetBtn("classP", e.target.dataset.classPermission);
    SetBtn("micP", e.target.dataset.micPermission);
    SetBtn("canP", e.target.dataset.canvasPermission);
    
    function SetBtn(id, ispermission){
      $('#' + id).clearQueue();
      $('#' +  id + '> .circle').clearQueue();
  
      if (ispermission == 'true') {
        $('#' + id).css({
          'background-color': '#18dbbe',
        });
        $('#' +  id + '> .circle').css({
          left: '22px',
        });
        $('#' + id).addClass('on');
        $('#' + id).removeClass('off');
      } else {
        $('#' + id).css({
          'background-color': 'gray',
        });
        $('#' + id + '> .circle').css({
          left: '2px',
        });
        $('#' + id).addClass('off');
        $('#' + id).removeClass('on');
      }
    }
    
    $(menu).css({
      right: document.body.clientWidth - e.clientX,
      top: e.clientY,
    });

    if (!$('#student-menu').is(':visible')) {
      $('#student-menu').show('blind', {}, 150, function () { });
    }

    menu.getElementsByClassName('stuname')[0].innerHTML = name;
  });
}

function PermissionButtonSetting(){
  $(".perbtn").click(function () {
    var circle = this.getElementsByClassName("circle")[0];
    var pid = nowSelectStudent.dataset.id;
  
    if (this.id == "classP") {
      if (this.classList.contains("off")) {
        if (classroomInfo.classPermission != undefined) {
          alert('이미 다른 학생에게 권한이 있습니다.');
          return false;
        }
  
        classroomInfo.classPermission = pid;
        nowSelectStudent.dataset.classPermission = true;
  
        if (classroomInfo.micPermission !== pid) {
          if (classroomInfo.micPermission === undefined) {
            classroomInfo.micPermission = pid;
          }
          else {
            $(`[data-id='${classroomInfo.micPermission}']`).attr('data-mic-Permission', false);
          }
          $('#micP').animate({ 'background-color': "#18dbbe" }, 'fast')
          $('#micP').children('.circle').animate({ left: "22px" }, 'fast')
          $('#micP').toggleClass("on off");
          classroomInfo.micPermission = pid;
          nowSelectStudent.dataset.micPermission = true;
        }

        if (classroomInfo.canvasPermission !== pid) {
          if (classroomInfo.canvasPermission === undefined) {
            classroomInfo.canvasPermission = pid;
          }
          else {
            $(`[data-id='${classroomInfo.canvasPermission}']`).attr('data-mic-Permission', false);
          }
          $('#canP').animate({ 'background-color': "#18dbbe" }, 'fast')
          $('#canP').children('.circle').animate({ left: "22px" }, 'fast')
          $('#canP').toggleClass("on off");
          classroomInfo.canvasPermission = pid;
          nowSelectStudent.dataset.canvasPermission = true;
        }

        $(this).animate({ 'background-color': '#18dbbe' }, 'fast');
        $(circle).animate({left: '22px'},'fast');
        $(nowSelectStudent).find(".bor").show();
      }
      else {
        if (classroomInfo.micPermission == classroomInfo.classPermission) {
          $('#micP').animate({'background-color': "gray"}, 'fast')
          $('#micP').children('.circle').animate({left: "2px"}, 'fast')
          classroomInfo.micPermission = undefined;
          nowSelectStudent.dataset.micPermission = false;
          $('#micP').toggleClass("on off");
        }

        if (classroomInfo.canvasPermission == classroomInfo.classPermission) {
          $('#canP').animate({'background-color': "gray"}, 'fast')
          $('#canP').children('.circle').animate({left: "2px"}, 'fast')
          classroomInfo.canvasPermission = undefined;
          nowSelectStudent.dataset.canvasPermission = false;
          $('#canP').toggleClass("on off");
        }

        classroomInfo.classPermission = undefined;
        nowSelectStudent.dataset.classPermission = false;
  
        $(this).animate({'background-color':'gray'},'fast');
        $(circle).animate({ left: '2px' }, 'fast');
        $(nowSelectStudent).find('.bor').hide();
      }
    }
  
    else if (this.id == "micP") {
      if (this.classList.contains("off")) {
        if (classroomInfo.micPermission != undefined) {
          alert('이미 다른 학생에게 권한이 있습니다.');
          return false;
        }
        classroomInfo.micPermission = pid;
        nowSelectStudent.dataset.micPermission = true;
        $(this).animate({'background-color':'#18dbbe'},'fast');
        $(circle).animate({left: '22px'},'fast');
      }
      else {
        classroomInfo.micPermission = undefined;
        nowSelectStudent.dataset.micPermission = false;
        $(this).animate({ 'background-color': 'gray' }, 'fast');
        $(circle).animate({ left: '2px' }, 'fast');
      }
    }
  
    else if (this.id == "canP"){
      if (this.classList.contains("off")) {
        if (classroomInfo.canvasPermission != undefined) {
          alert('이미 다른 학생에게 권한이 있습니다.');
          return false;
        }
        classroomInfo.canvasPermission = pid;
        nowSelectStudent.dataset.canvasPermission = true;
        $(this).animate({'background-color':'#18dbbe'},'fast');
        $(circle).animate({left: '22px'},'fast');
      }
      else {
        classroomInfo.canvasPermission = undefined;
        nowSelectStudent.dataset.canvasPermission = false;
        $(this).animate({ 'background-color': 'gray' }, 'fast');
        $(circle).animate({ left: '2px' }, 'fast');
      }
    }
  
    this.classList.toggle('on');
    this.classList.toggle('off');
  
  
    connection.send({ permissionChanged: classroomInfo });
    
    if(!classroomInfo.canvasPermission)    {
      ClearStudentCanvas()
    } 
    

    if (this.classList.contains("on")) {
      permissionManager.unmute(classroomInfo.micPermission);
    }
    else {
      permissionManager.mute();
    }
  });
}

