/////////////////////////////////////
// 학생 권한 ////////////////////////
/////////////////////////////////////

var nowSelectStudent = undefined;

permissionManager = {
  init: function () {
    $(window).click(function (e) {
      if (document.getElementById('student-menu').contains(e.target)) return false;
      if ($(e.target).hasClass('student')) return false;
      if ($('#student-menu').show()) $('#student-menu').hide();
    });

    $(".perbtn").click(function () {
      var circle = this.getElementsByClassName("circle")[0];
      var pid = nowSelectStudent.dataset.id;

      switch (this.id) {
        case "classP":
          if (this.classList.contains("off")) {
            if (classroomInfo.classPermission != undefined) {
              alert('이미 다른 학생에게 권한이 있습니다.');
              return false;
            }
            permissionManager.AddClassPermission(pid);
          }
          else {
            permissionManager.DeleteClassPermission(pid);
          }
          break;
        case "micP":
          if (this.classList.contains("off")) {
            if (classroomInfo.micPermission != undefined) {
              alert('이미 다른 학생에게 권한이 있습니다.');
              return false;
            }
            permissionManager.AddMicPermission(pid);
          }
          else {
            permissionManager.DeleteMicPermission(pid);
          }
          break;
        case "canP":
          if (this.classList.contains("off")) {
            permissionManager.AddCanvasPermission(pid);
          }
          else {
            permissionManager.DeleteCanvasPermission(pid);
          }
          break;
      }

      button(this, circle, this.classList.contains("off"))
      connection.send({ permissionChanged: classroomInfo });
    });
  },

  eventListener: function (event) {
    if (event.data.permissionChanged) {
      classroomInfo = event.data.permissionChanged;
      return true;
    }

    if (event.data.unmute) {
      permissionManager.unmute(event.data.unmute);
      return true;
    }

    if (event.data.mute) {
      permissionManager.mute();
      return true;
    }

    if (event.data.classPermissionChanged) {
      if (event.data.on)
        permissionManager.setClassPermission();
      else
        permissionManager.disableClassPermission();

      return true;
    }

    if (event.data.micPermissionChanged) {
      if (event.data.on)
        permissionManager.setMicPermission(event.data.id);
      else
        permissionManager.disableMicPermission();
      return true;
    }

    if (event.data.canvasPermissionChanged) {
      if (event.data.on) {
        permissionManager.setCanvasPermission(event.data.id);
      }
      else {
        permissionManager.disableCanvasPermission(event.data.id);
      }
      return true;
    }

  },

  mute: function () {
    connection.streamEvents.selectAll().forEach(function (e) {
      if (e.stream.isVideo && !e.extra.roomOwner && e.userid != classroomInfo.micPermission) {
        e.mediaElement.volume = 0;
      }
    })

    if (connection.extra.roomOwner) {
      connection.send({ mute: true });
    }
  },

  unmute: function (id) {
    connection.streamEvents.selectAll().forEach(function (e) {
      if (e.stream.isVideo && e.userid == id && !e.extra.roomOwner) {
        e.mediaElement.volume = 1;
      }
    })

    if (connection.extra.roomOwner) {
      connection.send({ unmute: id });
    }
  },

  IsCanvasPermission: function (id) {
    if (classroomInfo.canvasPermission.indexOf(id) == -1)
      return false;
    return true
  },

  // for teacher ======================================================================

  AddClassPermission: function (id) {
    classroomInfo.classPermission = id;
    FindInList(id).dataset.classPermission = true;
    console.log("Class permission added", id);
    MakeIcon(id, "screen");

    connection.send({
      classPermissionChanged: true,
      id: id,
      on: true
    }, id)
  },

  DeleteClassPermission: function (id) {
    classroomInfo.classPermission = undefined;
    console.log("Class permission removed", id);
    FindInList(id).dataset.classPermission = false;
    DeleteIcon(id, "screen");

    connection.send({
      classPermissionChanged: true,
      id: id,
      on: false
    }, id)
  },

  AddMicPermission: function (id) {
    console.log("Mic permission added", id);
    classroomInfo.micPermission = id;
    permissionManager.unmute(id);
    FindInList(id).dataset.micPermission = true;
    MakeIcon(id, "mic");

    connection.send({
      micPermissionChanged: true,
      id: id,
      on: true
    })
  },

  DeleteMicPermission: function (id) {
    console.log("Mic permission removed", id);
    classroomInfo.micPermission = undefined;
    permissionManager.mute();
    FindInList(id).dataset.micPermission = false;
    DeleteIcon(id, "mic");

    connection.send({
      micPermissionChanged: true,
      id: id,
      on: false
    })
  },

  AddCanvasPermission: function (id) {
    classroomInfo.canvasPermission.push(id);
    console.log("Canvas permission added", id, classroomInfo.canvasPermission);
    FindInList(id).dataset.canvasPermission = true;
    MakeIcon(id, "canvas");
    connection.send({
      canvasPermissionChanged: true,
      id: id,
      on: true
    }, id)
  },

  DeleteCanvasPermission: function (id) {
    var idx = classroomInfo.canvasPermission.indexOf(id);
    classroomInfo.canvasPermission.splice(idx, 1);
    ClearStudentCanvas(id);
    console.log("Canvas permission removed", id, classroomInfo.canvasPermission);
    FindInList(id).dataset.canvasPermission = false;
    DeleteIcon(id, "canvas");
    connection.send({
      canvasPermissionChanged: true,
      id: id,
      on: false
    })
  },


  // for student ==================================================================

  setClassPermission: function () {
    console.log("GET CLASS PERMISSION");
    document.getElementById("class_permission").innerHTML = "화면 공유 권한";
    window.permission = true;
  },

  disableClassPermission: function () {
    console.log("LOST CLASS PERMISSION");
    document.getElementById("class_permission").innerHTML = "";
    if (classroomInfoLocal.shareScreen.state) {
      isSharingScreen = false;
      if (typeof (lastStream) !== "undefined")
        lastStream.getTracks().forEach((track) => track.stop());
      return false;
    }
    window.permission = false;
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

  setCanvasPermission: function (id) {
    console.log("GET CANVAS PERMISSION");
    connection.send({
      sendStudentPoint: true,
      isStudent: true,
      points: currentPoints,
      history: currentHistory,
      userid: id,
    })
  },

  disableCanvasPermission: function (id) {
    console.log("LOST CANVAS PERMISSION");
    ClearStudentCanvas(id);
  },

  disableMicPermission: function () {
    console.log("LOST MIC PERMISSION");
    document.getElementById("mic_permission").innerHTML = "";
    this.mute();
  },
  // =============================================================================


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

    function SetBtn(id, ispermission) {
      $('#' + id).clearQueue();
      $('#' + id + '> .circle').clearQueue();

      if (ispermission == 'true') {
        $('#' + id).css({ 'background-color': '#18dbbe' });
        $('#' + id + '> .circle').css({ left: '22px' });
        $('#' + id).addClass('on');
        $('#' + id).removeClass('off');
      } else {
        $('#' + id).css({ 'background-color': 'gray', });
        $('#' + id + '> .circle').css({ left: '2px', });
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

function button(t, c, on) {
  if (on) {
    $(t).animate({ 'background-color': '#18dbbe' }, 'fast');
    $(c).animate({ left: '22px' }, 'fast');
  }
  else {
    $(t).animate({ 'background-color': 'gray' }, 'fast');
    $(c).animate({ left: '2px' }, 'fast');
  }

  t.classList.toggle('on');
  t.classList.toggle('off');
}

function FindInList(id){
  return $("#student_list").find("span[data-id=" + id + "]")[0];
}

function MakeIcon(id, type){
  var img = document.createElement("img");
  img.src = "/dashboard/img/permission_" + type + ".png";
  img.className = "img " + type;

  var perlist = FindInList(id).getElementsByClassName("permissions")[0];
  perlist.appendChild(img);

  perlist.style.display = 'block';
}

function DeleteIcon(id, type){
  var node = FindInList(id)
  console.log(node.getElementsByClassName(type)[0]);
  node.getElementsByClassName(type)[0].parentElement.removeChild(node.getElementsByClassName(type)[0])

  if(FindInList(id).getElementsByClassName("permissions")[0].children.length == 0){
    FindInList(id).getElementsByClassName("permissions")[0].style.display = "none";
  }
}