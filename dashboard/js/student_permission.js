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
        $('#student-menu').show('blind', {}, 150, function () {});
      }
  
      menu.getElementsByClassName('stuname')[0].innerHTML = name;
    });
  }
  
  
$('.student').click(function (e) {
  var menu = document.getElementById('student-menu');
  nowSelectStudent = e.target;
  var name = e.target.dataset.name;
  var pid = e.target.dataset.id;

  $('#classP').clearQueue();
  $('#classP > .circle').clearQueue();

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
    $('#student-menu').show('blind', {}, 150, function () {});
  }

  menu.getElementsByClassName('stuname')[0].innerHTML = name;
});
