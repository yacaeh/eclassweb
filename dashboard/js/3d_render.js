var newPosition;
var newRotation;
var engine;
var scene;
var interval;
var mesh;
var light;
var camera;

/******* Add the create scene function ******/
var createScene = function (_canvas) {

    // Add a camera to the scene and attach it to the canvas
    // Add lights to the scene

    mesh = BABYLON.SceneLoader.ImportMesh("","./assets/models/scenes/", "skull.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        camera.target = newMeshes[0];
        newPosition = camera.position;
        newRotation = camera.absoluteRotation;
    });

    scene.registerBeforeRender(function () {
        light.position = camera.position;
    });

    interval = setInterval(function () {
        if(classroomInfo.allControl == true && camera !== null)
        {
            if(newPosition !== undefined && BABYLON.Vector3.Distance(camera.position,newPosition) > 0)
                camera.position = new BABYLON.Vector3.Lerp(camera.position,newPosition,0.2);
            if(newRotation !== undefined && BABYLON.Vector3.Distance(camera.absoluteRotation,newRotation) > 0)
                camera.absoluteRotation = new BABYLON.Vector3.Lerp(camera.absoluteRotation,newRotation,0.2);
        }
    }, 10);

    engine.runRenderLoop(function () {
        scene.render();
    });
    
    window.addEventListener("resize", function () {
        engine.resize();
    });
};
/******* End of the create scene function ******/

let frame;
let _3dcanvas;
let rtime;
let timeout = false;
let delta = 400;

let top_3d_button = $('#top_3d');
// let is3dViewer = false;


function _3DCanvasFunc(){
top_3d_render_jthis = $("#top_3d");      

    window.addEventListener("resize", function() {
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(resizeend, delta);
        }
    });
    
    function resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(resizeend, delta);
        } else {
            timeout = false;
            CanvasResize();
        }               
    }
}

function modelEnable()
{
    let frame = GetWidgetFrame();

    if(frame.document.getElementById("renderCanvas")){
        let _3d_canvas = frame.document.getElementById("renderCanvas");
        GetWidgetFrame().document.getElementById("renderCanvas").style.display = "block";
        createScene(_3d_canvas); //Call the createScene function
    }
    else{
        let _3d_canvas = document.createElement('canvas');
        _3d_canvas.setAttribute('id', 'renderCanvas');
        _3d_canvas.style.cssText = 'position:absolute';
        frame.document.getElementsByClassName('design-surface')[0].appendChild(_3d_canvas);
        frame.document.getElementById("main-canvas").style.zIndex = "1";
        frame.document.getElementById("temp-canvas").style.zIndex = "2";
        frame.document.getElementById("tool-box").style.zIndex = "3";
        engineInit(_3d_canvas);
        createScene(_3d_canvas); //Call the createScene function
    }
    
    CanvasResize();
}

function engineInit(canvas){
    engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    engine.enableOfflineSupport = false;
    engine.doNotHandleContextLost = true;
    scene = new BABYLON.Scene(engine);
    light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);

    function SendStateData(_position, _rotation)
    {
        if(params.open == "true")
        {            
            updateShared3DData (_position, _rotation);
            connection.send({
                ModelState : {
                    position : _position,
                    rotation : _rotation
                }
            });
        }
    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                SendStateData(camera.position,camera.absoluteRotation);
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                break;
            case BABYLON.PointerEventTypes.POINTERWHEEL:
                SendStateData(camera.position,camera.absoluteRotation);
                break;
            case BABYLON.PointerEventTypes.POINTERPICK:
                break;
            case BABYLON.PointerEventTypes.POINTERTAP:
                break;
            case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                break;
        }
    });
    
    camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.inertia = false;
}


function remove3DCanvas(){
    scene.removeMesh(mesh);
    scene.meshes.forEach(element => element.dispose());
    // console.log(scene.meshes);
    // console.log(scene.onPointerObservable);
    // console.log(scene.rootNodes);
    scene.cleanCachedTextureBuffer();
    scene.clearCachedVertexData();
    clearInterval(interval);
    GetWidgetFrame().document.getElementById("renderCanvas").style.display = "none";
}

function CanvasResize() {
    //console.log(_3dcanvas);
    _3dcanvas = frame.document.getElementById("renderCanvas")
    
    var canvas = frame.document.getElementById("main-canvas");
    var r = document.getElementsByClassName("lwindow")[0];
    var rwidth = $(r).width();
    
    _3dcanvas.width = canvas.width - rwidth - 50;
    _3dcanvas.height = canvas.height - 60;
}

function set3DModelStateData(_newPosition, _newRotation) {
    newPosition = _newPosition;
    newRotation = _newRotation;
}


/*
    data를 갱신
*/
function updateShared3DData (_pos, _rot) {
    // data를 추가할 때, json으로 추가하면 된다.
    classroomInfo.share3D.data = {
        newPosition : _pos,
        newRotation : _rot
    }
}
/*
    선생님의 화면과 동기화 시킨다
*/
function sync3DModel () {                
    var data = classroomInfo.share3D.data;   
        
    if(classroomInfo.share3D.state != isSharing3D) {
        isSharing3D = classroomInfo.share3D.state
        setShared3DStateLocal (classroomInfo.share3D.state);;
    }
    
    set3DModelStateData (data.newPosition, data.newRotation);
}

function setShared3DStateServer (_state) {
    // classroomInfo.share3D.state
    if(!connection.extra.roomOwner)  return;

    connection.socket.emit ('toggle-share-3D', (result) => {
        // console.log(result);
        if(result.result) {
            // success            
            setShared3DStateLocal (result.data);        
            connection.send({
                modelEnable: { enable: classroomInfo.share3D.state }
            });
        }else {
            // error
            
        }
    })
}

function setShared3DStateLocal (_state) {
    
    classroomInfo.share3D.state = _state;
    top_3d_button.toggle('top_3d_on');
    top_3d_button.toggle('top_3d_off')
    if(_state) {                
            modelEnable ();        
    }
    else  {
        remove3DCanvas ();
    }
}


function _3DCanvasOnOff(btn) {
    if (!classroomInfo.share3D.state && checkSharing()) {
      removeOnSelect(btn);
      return;
    }
    ClearCanvas();
    if (params.open == 'true') {
      const isViewer = classroomInfo.share3D.state;
      if (false == isViewer) {
        isSharing3D = true;
        setShared3DStateServer(true);
      }
      else {
        isSharing3D = false;
        setShared3DStateServer(false);
      }
    }
  }