/////////////////////////////////////
// 학생 권한 ////////////////////////
/////////////////////////////////////

var nowSelectStudent = undefined;

permissionManager = {
  onPermissionChange : function(data){
    if (data.permissionChanged.classPermission)
      permissionManager.setClassPermission(data.permissionChanged.classPermission);
    else
      permissionManager.disableClassPermission();

    if (data.permissionChanged.micPermission)
      permissionManager.setMicPermission(data.permissionChanged.micPermission);
    else
      permissionManager.disableMicPermission();

    if (data.permissionChanged.canvasPermission)
      permissionManager.setCanvasPermission(data.permissionChanged.canvasPermission);
    else {
      permissionManager.disableCanvasPermission();
    }
  },

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
      connection.send({
        sendStudentPoint : true,
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
        $('#' + id).css({'background-color': '#18dbbe'});
        $('#' +  id + '> .circle').css({left: '22px'});
        $('#' + id).addClass('on');
        $('#' + id).removeClass('off');
      } else {
        $('#' + id).css({'background-color': 'gray',});
        $('#' + id + '> .circle').css({left: '2px',});
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
  $(window).click(function (e) {
    if (document.getElementById('student-menu').contains(e.target)) return false;
    if ($(e.target).hasClass('student')) return false;
    if ($('#student-menu').show()) $('#student-menu').hide();
  });

  function ButtonOn(element){
    $('#' + element).animate({ 'background-color': "#18dbbe" }, 'fast')
    $('#' + element).children('.circle').animate({ left: "22px" }, 'fast')
    $('#' + element).addClass("on");
    $('#' + element).removeClass("off");
  }

  function ButtonOff(element){
    $('#' + element).animate({ 'background-color': "gray" }, 'fast')
    $('#' + element).children('.circle').animate({ left: "2px" }, 'fast')
    $('#' + element).removeClass("on");
    $('#' + element).addClass("off");
  }

  $(".perbtn").click(function () {
    var circle = this.getElementsByClassName("circle")[0];
    var pid = nowSelectStudent.dataset.id;
  
    if (this.id == "classP") {
      if (this.classList.contains("off")) {
        if (classroomInfo.classPermission != undefined ||
          (classroomInfo.canvasPermission != undefined && classroomInfo.canvasPermission != pid) || 
          (classroomInfo.micPermission != undefined  && classroomInfo.micPermission != pid )) {
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
          ButtonOn("micP");
          classroomInfo.micPermission = pid;
          nowSelectStudent.dataset.micPermission = true;
        }

        if (classroomInfo.canvasPermission !== pid) {
          if (classroomInfo.canvasPermission === undefined) {
            classroomInfo.canvasPermission = pid;
          }
          else {
            $(`[data-id='${classroomInfo.canvasPermission}']`).attr('data-canvas-Permission', false);
          }
          ButtonOn("canP");
          classroomInfo.canvasPermission = pid;
          nowSelectStudent.dataset.canvasPermission = true;
        }

        $(this).animate({ 'background-color': '#18dbbe' }, 'fast');
        $(circle).animate({left: '22px'},'fast');
      }
      else {
        if (classroomInfo.micPermission == classroomInfo.classPermission) {
          ButtonOff("micP");
          classroomInfo.micPermission = undefined;
          nowSelectStudent.dataset.micPermission = false;
        }

        if (classroomInfo.canvasPermission == classroomInfo.classPermission) {
          ButtonOff("canP");
          classroomInfo.canvasPermission = undefined;
          nowSelectStudent.dataset.canvasPermission = false;
        }

        classroomInfo.classPermission = undefined;
        nowSelectStudent.dataset.classPermission = false;
  
        $(this).animate({'background-color':'gray'},'fast');
        $(circle).animate({ left: '2px' }, 'fast');
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
  
    var cp = nowSelectStudent.dataset.classPermission;
    var cap = nowSelectStudent.dataset.canvasPermission;
    var mp = nowSelectStudent.dataset.micPermission;

    $(nowSelectStudent).find(".bor")[0].className = "bor";
    
    if(cp === "true"){
      $(nowSelectStudent).find(".bor")[0].classList.add("class")
    }
    else if(mp === "true"){
      $(nowSelectStudent).find(".bor")[0].classList.add("mic")
    }
    else if(cap === "true"){
      $(nowSelectStudent).find(".bor")[0].classList.add("canvas")
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

