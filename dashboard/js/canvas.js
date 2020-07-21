var designer = new CanvasDesigner();
designer.widgetHtmlURL = './canvas/widget.html';
designer.widgetJsURL = './widget.js';

designer.icons.pencil = '/dashboard/newimg/pen.png';
designer.icons.marker = '/dashboard/newimg/pen2.png';
designer.icons.eraser = '/dashboard/newimg/eraser.png';
designer.icons.clearCanvas = '/dashboard/newimg/trash.png';
designer.icons.pdf = '/dashboard/img/iconfinder_File.png';
designer.icons.on = '/dashboard/img/view_on.png';
designer.icons.off = '/dashboard/img/view_off.png';
designer.icons.screenShare = '/dashboard/newimg/screenshare.png';
designer.icons.view3d = '/dashboard/newimg/3D.png';
designer.icons.view3don = '/dashboard/newimg/3D.png';
designer.icons.movie = '/dashboard/newimg/videolink.png';
designer.icons.file = '/dashboard/newimg/openfile.png';
designer.icons.text = '/dashboard/newimg/text.png';
designer.icons.epub = '/dashboard/newimg/epub.png';
designer.icons.callteacher = '/dashboard/newimg/handsup.png';
designer.icons.homework = '/dashboard/newimg/homework.png';

designer.icons.fulloff = '/dashboard/img/cam_min.png';
designer.icons.fullon = '/dashboard/img/cam_max.png';



designer.addSyncListener(function (data) {
    var isStudent = data.userid == classroomInfo.canvasPermission;
    if(connection.extra.roomOwner || isStudent){
        data.isStudent = isStudent;
        connection.send(data);
    }
});


designer.setTools({
  pencil: true,
  text: true,
  image: false,
  pdf: false,
  eraser: true,
  line: true,
  arrow: false,
  dragSingle: false,
  dragMultiple: false,
  arc: false,
  rectangle: false,
  quadratic: false,
  bezier: false,
  marker: true,
  zoom: false,
  lineWidth: false,
  colorsPicker: false,
  clearCanvas: true,
  onoff: true,
  code: false,
  undo: true,
  screenShare: true,
  view3d: true,
  movie: true,
  file: true,
  callteacher: true,
  homework : true,
});

function SetCanvasBtn(btnid, callback){
    function checkf(){
        if(designer.iframe != null){
            clearInterval(inter)
            
            let frame = document
            .getElementById('widget-container')
            .getElementsByTagName('iframe')[0].contentWindow;
            var btn = frame.document.getElementById(btnid);
            if(btn)
            btn.addEventListener("click", function(){
                callback(btn);
            })
        }
    }
    var inter = setInterval(checkf, 1000);
}