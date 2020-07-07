function OnClickStudent(div) {
  div.click(function (e) {
    var menu = document.getElementById('student-menu');
    nowSelectStudent = e.target;

    var name = e.target.dataset.name;
    var pid = e.target.dataset.id;

    $('#perbtn').clearQueue();
    $('#perbtn > .circle').clearQueue();

    if (e.target.dataset.classPermission == 'true') {
      $('#classP').css({
        'background-color': '#18dbbe',
      });
      $('#classP > .circle').css({
        left: '22px',
      });
      $('#classP').addClass('on');
      $('#classP').removeClass('off');
    } else {
      $('#classP').css({
        'background-color': 'gray',
      });
      $('#classP > .circle').css({
        left: '2px',
      });
      $('#classP').addClass('off');
      $('#classP').removeClass('on');
    }

    $('#micP').clearQueue();
    $('#micP > .circle').clearQueue();

    if (e.target.dataset.micPermission == 'true') {
      $('#micP').css({
        'background-color': '#18dbbe',
      });
      $('#micP > .circle').css({
        left: '22px',
      });
      $('#micP').addClass('on');
      $('#micP').removeClass('off');
    } else {
      $('#micP').css({
        'background-color': 'gray',
      });
      $('#micP > .circle').css({
        left: '2px',
      });
      $('#micP').addClass('off');
      $('#micP').removeClass('on');
    }

    $(menu).css({
      left: e.clientX,
      top: e.clientY,
    });

    if (!$('#student-menu').is(':visible')) {
      $('#student-menu').show('blind', {}, 150, function () { });
    }

    menu.getElementsByClassName('stuname')[0].innerHTML = name;
  });
}




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
        e.stream.mute("audio");
      }
    })

    if(connection.extra.roomOwner){
      connection.send({mute : true});
    }
  },

  unmute: function (id) {
    var array = [];

    connection.streamEvents.selectAll().forEach(function (e) {
      if(e.stream.isVideo && 
        e.userid == id && 
        !e.extra.roomOwner && 
        e.type != "remote"){
        console.log("UNMUTED ", e);
        e.stream.unmute("audio");
      }
    })

    if(id == connection.userid){
        connection.streamEvents.selectAll().forEach(function(e){
          if(e.extra.roomOwner && e.stream.isVideo && e.userid == id){
            e.stream.mute("audio");
          }
        })
    }

    if(connection.extra.roomOwner){
      connection.send({unmute : id});
      // e.forEach(element => element.stream.mute("audio"));
    }
  }
}