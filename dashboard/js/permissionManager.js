class permissionManagerClass {
  constructor() {
    this.nowSelectStudent = undefined;
  }

  init() {
    window.addEventListener("click", (e) => {
      if (document.getElementById('student-menu').contains(e.target)) return false;
      if ($(e.target).hasClass('student')) return false;
      if ($('#student-menu').show()) $('#student-menu').hide();
    });

    $(".perbtn").click(function () {
      var circle = this.getElementsByClassName("circle")[0];
      var pid = permissionManager.nowSelectStudent.dataset.id;

      switch (this.id) {
        case "classP":
          if (this.classList.contains("off")) {
            if (classroomInfo.classPermission != undefined) {
              alert($.i18n('STUDENT_PERMISSION_ALREADY'));
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
              alert($.i18n('STUDENT_PERMISSION_ALREADY'));
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
  }
  eventListener(event) {
    if (event.data.permissionChanged) {
      classroomInfo = event.data.permissionChanged;
      return true;
    }

    if (event.data.classPermissionChanged) {
      event.data.on ? permissionManager.setClassPermission() : permissionManager.disableClassPermission();
      return true;
    }

    if (event.data.micPermissionChanged) {
      event.data.on ? permissionManager.setMicPermission() : permissionManager.disableMicPermission()
      return true;
    }

    if (event.data.canvasPermissionChanged) {
      event.data.on ? permissionManager.setCanvasPermission(event.data.id) : permissionManager.disableCanvasPermission(event.data.id)
      return true;
    }
  }
  mute() {
    connection.attachStreams.forEach(function (e) {
      if (e.isVideo)
        e.mute("audio");
    })
  }

  unmute() {
    connection.attachStreams.forEach(function (e) {
      if (e.isVideo)
        e.unmute("audio");
    })
  }

  IsCanvasPermission(id) {
    if (classroomInfo.canvasPermission.indexOf(id) == -1)
      return false;
    return true
  }

  AddClassPermission(id) {
    classroomInfo.classPermission = id;
    FindInList(id).dataset.classPermission = true;
    console.log("Class permission added", id);
    MakeIcon(id, "screen");
    classroomManager.updateClassroomInfo();

    connection.send({
      classPermissionChanged: true,
      id: id,
      on: true
    }, id)
  }

  DeleteClassPermission(id) {
    classroomInfo.classPermission = undefined;
    console.log("Class permission removed", id);
    FindInList(id).dataset.classPermission = false;
    DeleteIcon(id, "screen");
    classroomManager.updateClassroomInfo();

    connection.send({
      classPermissionChanged: true,
      id: id,
      on: false
    }, id)
  }

  AddMicPermission(id) {
    console.log("Mic permission added", id);
    classroomInfo.micPermission = id;
    FindInList(id).dataset.micPermission = true;
    MakeIcon(id, "mic");
    classroomManager.updateClassroomInfo();

    connection.send({
      micPermissionChanged: true,
      id: id,
      on: true
    }, id)
  }
  
  DeleteMicPermission(id) {
    console.log("Mic permission removed", id);
    classroomInfo.micPermission = undefined;
    FindInList(id).dataset.micPermission = false;
    DeleteIcon(id, "mic");
    classroomManager.updateClassroomInfo();

    connection.send({
      micPermissionChanged: true,
      id: id,
      on: false
    }, id)
  }
  
  AddCanvasPermission(id) {
    classroomInfo.canvasPermission.push(id);
    console.log("Canvas permission added", id, classroomInfo.canvasPermission);
    FindInList(id).dataset.canvasPermission = true;
    MakeIcon(id, "canvas");
    classroomManager.updateClassroomInfo();

    connection.send({
      canvasPermissionChanged: true,
      id: id,
      on: true
    }, id)
  }

  DeleteCanvasPermission(id) {
    var idx = classroomInfo.canvasPermission.indexOf(id);
    classroomInfo.canvasPermission.splice(idx, 1);
    canvasManager.clearStudentCanvas(id);
    console.log("Canvas permission removed", id, classroomInfo.canvasPermission);
    FindInList(id).dataset.canvasPermission = false;
    DeleteIcon(id, "canvas");
    classroomManager.updateClassroomInfo();

    connection.send({
      canvasPermissionChanged: true,
      id: id,
      on: false
    })
  }

  // for student ==================================================================
  setClassPermission() {
    console.debug("Get Screen share permission");
    Show("student_screenshare");
    // document.getElementById("class_permission").innerHTML = $.i18n('STUDENT_SCREEN_PERMISSION');
    window.permission = true;
  };

  disableClassPermission() {
    console.debug("Lost Screen share permission");
    Hide("student_screenshare");

    if (classroomInfo.shareScreen.state) {
      screenshareManager.isSharingScreen = false;
      if (typeof (screenshareManager.lastStream) !== "undefined")
        screenshareManager.lastStream.getTracks().forEach((track) => track.stop());
      return false;
    }

    window.permission = false;
  };

  setMicPermission() {
    console.debug("Get mic permission");
    Show("student_mic");
    // document.getElementById("mic_permission").innerHTML = $.i18n('STUDENT_MIC_PERMISSION');
    this.unmute();
  };

  disableMicPermission() {
    console.debug("Lost mic permission");
    Hide("student_mic");
    this.mute();
  };

  setCanvasPermission(id) {
    console.debug("Get canvas share permission");
    Show("student_canvas");
    connection.send({
      sendStudentPoint: true,
      isStudent: true,
      points: currentPoints,
      history: currentHistory,
      userid: id,
    })
  };

  disableCanvasPermission(id) {
    console.debug("Lost canvas share permission");
    Hide("student_canvas");
    canvasManager.clearStudentCanvas(id);
  };
}



function OnClickStudent(div) {
  div.addEventListener("click", function (e) {
    var menu = document.getElementById('student-menu');
    var name = e.target.dataset.name;

    permissionManager.nowSelectStudent = e.target;

    SetBtn("classP", e.target.dataset.classPermission);
    SetBtn("micP", e.target.dataset.micPermission);
    SetBtn("canP", e.target.dataset.canvasPermission);

    function SetBtn(id, ispermission) {
      let btn = $('#' + id);
      let circle = $('#' + id + '> .circle');

      btn.clearQueue();
      circle.clearQueue();

      if (ispermission == 'true') {
        btn.css({ 'background-color': '#18dbbe' });
        circle.css({ left: '22px' });
        btn.addClass('on');
        btn.removeClass('off');
      } else {
        btn.css({ 'background-color': 'gray', });
        circle.css({ left: '2px', });
        btn.addClass('off');
        btn.removeClass('on');
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

function FindInList(id) {
  return $("#student_list").find("span[data-id=" + id + "]")[0];
}

function MakeIcon(id, type) {
  var img = document.createElement("img");
  img.src = "/dashboard/img/permission_" + type + ".png";
  img.className = "img " + type;

  var perlist = FindInList(id).getElementsByClassName("permissions")[0];
  perlist.appendChild(img);

  perlist.style.display = 'block';
}

function DeleteIcon(id, type) {
  var node = FindInList(id)
  node.getElementsByClassName(type)[0].parentElement.removeChild(node.getElementsByClassName(type)[0])

  if (FindInList(id).getElementsByClassName("permissions")[0].children.length == 0) {
    FindInList(id).getElementsByClassName("permissions")[0].style.display = "none";
  }
}