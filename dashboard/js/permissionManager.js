class permissionManagerClass {
  constructor() {
    this.nowSelectStudent = undefined;
  }

  init() {
    window.addEventListener("click", (e) => {
      if (document.getElementById('student-menu').contains(e.target)) 
        return false;
      
      if (e.target.classList.contains('student')) 
      return false;
      
      if ($('#student-menu').show()) 
        $('#student-menu').hide();
    });

    $(".perbtn").click(function () {
      var circle = this.getElementsByClassName("circle")[0];
      var pid = permissionManager.nowSelectStudent.dataset.id;

      switch (this.id) {
        case "classP":
          if (this.classList.contains("off")) {
            if (classroomInfo.permissions.classPermission) {
              alert(window.langlist.STUDENT_PERMISSION_ALREADY);
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
            if (classroomInfo.permissions.micPermission) {
              alert(window.langlist.STUDENT_PERMISSION_ALREADY);
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
      event.data.on ? permissionManager.setClassPermission() : 
                      permissionManager.disableClassPermission();
      return true;
    }

    if (event.data.micPermissionChanged) {
      event.data.on ? permissionManager.setMicPermission(event.data.id) : 
                      permissionManager.disableMicPermission(event.data.id)
      return true;
    }

    if (event.data.canvasPermissionChanged) {
      event.data.on ? permissionManager.setCanvasPermission(event.data.id) : permissionManager.disableCanvasPermission(event.data.id)
      return true;
    }
  }

  IsCanvasPermission(id) {
    if(classroomInfo.permissions.canvasPermission == undefined){
      return false;
    }
    if (classroomInfo.permissions.canvasPermission.indexOf(id) == -1)
      return false;
    return true
  }

  AddClassPermission(id) {
    classroomInfo.permissions.classPermission = id;
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
    classroomInfo.permissions.classPermission = undefined;
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
    classroomInfo.permissions.micPermission = id;
    FindInList(id).dataset.micPermission = true;
    MakeIcon(id, "mic");
    classroomManager.updateClassroomInfo();
    studentContainer[id].getElementsByTagName('video')[0].muted = false;

    connection.send({
      micPermissionChanged: true,
      id: id,
      on: true
    })
  }
  
  DeleteMicPermission(id) {
    console.log("Mic permission removed", id);
    classroomInfo.permissions.micPermission = undefined;
    FindInList(id).dataset.micPermission = false;
    DeleteIcon(id, "mic");
    classroomManager.updateClassroomInfo();
    studentContainer[id].getElementsByTagName('video')[0].muted = true;

    connection.send({
      micPermissionChanged: true,
      id: id,
      on: false
    })
  }
  
  AddCanvasPermission(id) {
    classroomInfo.permissions.canvasPermission.push(id);
    console.log("Canvas permission added", id, classroomInfo.permissions.canvasPermission);
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
    var idx = classroomInfo.permissions.canvasPermission.indexOf(id);
    classroomInfo.permissions.canvasPermission.splice(idx, 1);
    canvasManager.clearStudentCanvas(id);
    console.log("Canvas permission removed", id, classroomInfo.permissions.canvasPermission);
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
    store.dispatch({
      type : PERMISSION_CHANGED,
      data : { ...store.getState().permissions, screen : true}
    })

    classroomInfo.permissions.classPermission = connection.userid;
    window.permission = true;
  };

  disableClassPermission() {
    console.debug("Lost Screen share permission");
    classroomInfo.permissions.classPermission = '';
    store.dispatch({
      type : PERMISSION_CHANGED,
      data : { ...store.getState().permissions, screen : false}
    })

    if (classroomInfo.shareScreen.state) {
      screenshareManager.isSharingScreen = false;
      if (typeof (screenshareManager.lastStream) !== "undefined")
        screenshareManager.lastStream.getTracks().forEach((track) => track.stop());
      return false;
    }

    window.permission = false;
  };

  setMicPermission(id) {
    console.debug("Get mic permission",id);
  
    if(id != connection.userid){
      studentContainer[id].getElementsByTagName('video')[0].muted = false;
    }
    else{
      store.dispatch({
        type : PERMISSION_CHANGED,
        data : { ...store.getState().permissions, mic : true}
      })
    }
  };
  
  disableMicPermission(id) {
    
    console.debug("Lost mic permission",id);
    if(id != connection.userid){
      studentContainer[id].getElementsByTagName('video')[0].muted = true;
    }
    else{
      store.dispatch({
        type : PERMISSION_CHANGED,
        data : { ...store.getState().permissions, mic : false}
      })
    }
  };

  setCanvasPermission(id) {
    console.debug("Get canvas share permission");
    store.dispatch({
      type : PERMISSION_CHANGED,
      data : { ...store.getState().permissions, canvas : true}
    })

    console.log(classroomInfo.permissions.canvasPermission)
    classroomInfo.permissions.canvasPermission.push(id);

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
    store.dispatch({
      type : PERMISSION_CHANGED,
      data : { ...store.getState().permissions, canvas : false}
    })

    classroomInfo.permissions.canvasPermission = [];
    if(connection.userid == id)
    canvasManager.clearStudentCanvas(id);
  };
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
  let finded = $("#student_list").find("span[data-id=" + id + "]")[0];
  return finded ? finded : undefined;
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