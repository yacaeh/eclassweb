





var newPosition;
var newRotation;
/******* Add the create scene function ******/
var createScene = function (_canvas) {
    let canvas = _canvas; // Get the canvas element

    let engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
        var scene = new BABYLON.Scene(engine);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    
    camera.inertia = false;
    // Add lights to the scene
    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);

    var model = BABYLON.SceneLoader.ImportMesh("","./assets/models/scenes/", "skull.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        camera.target = newMeshes[0];


        newPosition = camera.position;
        newRotation = camera.absoluteRotation;
    });

    scene.registerBeforeRender(function () {
        light.position = camera.position;
    });

    setInterval(function () {
        if(camera !== null)
        {
            if(classroomInfo.allControl == true)
            {
            if(newPosition !== undefined && BABYLON.Vector3.Distance(camera.position,newPosition) > 0)
                camera.position = new BABYLON.Vector3.Lerp(camera.position,newPosition,0.2);
            if(newRotation !== undefined && BABYLON.Vector3.Distance(camera.absoluteRotation,newRotation) > 0)
                camera.absoluteRotation = new BABYLON.Vector3.Lerp(camera.absoluteRotation,newRotation,0.2);
            }
        }
    }, 10);

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

    function SendStateData(_position, _rotation)
    {
        if(params.open == "true")
        {            
            // 공유 데이터에 update
            updateShared3DData (_position, _rotation);
            connection.send({
                ModelState : {
                    position : _position,
                    rotation : _rotation
                }
            });
        }
    }

    

    // BABYLON.SceneLoader.Append("./assets/models/dump/", "GazAA.glb", scene, function (newMeshes) {
    //     scene.createDefaultCameraOrLight(true);
    //     scene.activeCamera.attachControl(canvas, false);
    //     scene.activeCamera.alpha += Math.PI; // camera +180°
    //     //console.log("testssss z z z z z z");
    // });
    //console.log("Create 3D!");
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });
    
    // Watch for browser/canvas resize events
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
    //console.log("3d cansvasFunc!");
    //console.log(top_3d_button);
    top_3d_button.click(function () {   


      });
      

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
    frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
    //console.log(classroomInfo);
    // create 3d canvas on model enanbled      
    let _3d_canvas = document.createElement('canvas');
    _3d_canvas.setAttribute('id', 'renderCanvas');
    _3d_canvas.style.cssText = 'position:absolute';
    
    frame.document
    .getElementsByClassName('design-surface')[0]
    .appendChild(_3d_canvas);
    frame.document.getElementById("main-canvas").style.zIndex = "1";
    frame.document.getElementById("temp-canvas").style.zIndex = "2";
    frame.document.getElementById("tool-box").style.zIndex = "3";
    _3d_canvas = frame.document.getElementById("renderCanvas"); 
    _3dcanvas = _3d_canvas;
    createScene(_3d_canvas); //Call the createScene function
    //_3dcanvas.style.display = 'inline-block';
    CanvasResize();
    top_3d_button.addClass('top_3d_on');
    top_3d_button.removeClass('top_3d_off')
    // if (send == true) {
    //     connection.send({
    //         modelEnable: { enable: true }
    //     });
    // }
}


function remove3DCanvas(){
    //console.log("remove 3d!");
    frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
    
    frame.document.getElementById("renderCanvas").remove();
    top_3d_button.addClass('top_3d_off');
    top_3d_button.removeClass('top_3d_on')   
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
        console.log(result);
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
    if(_state) {                
            modelEnable ();        
    }
    else  {
        remove3DCanvas ();
    }
}
