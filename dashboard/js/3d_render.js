


var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine



var newPosition;
var newRotation;
/******* Add the create scene function ******/
var createScene = function () {
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
            if(newPosition !== undefined)
                camera.position = new BABYLON.Vector3.Lerp(camera.position,newPosition,0.2);
            if(newRotation !== undefined)
                camera.absoluteRotation = new BABYLON.Vector3.Lerp(camera.position,newRotation,0.2);
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
    //     console.log("testssss z z z z z z");
    // });

    return scene;
};
/******* End of the create scene function ******/

var scene = createScene(); //Call the createScene function



console.log("Create 3D!");
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});



var _3dcanvas =  $("#renderCanvas");
var rtime;
var timeout = false;
var delta = 400;

var top_3d_render_jthis;
function _3DCanvasFunc(){
    top_3d_render_jthis = $("#top_3d");
    top_3d_render_jthis.click(function(){
        //_3dcanvas.toggle();
        var visible = _3dcanvas.is(':visible');
       
    
        if(params.open == "true")
        {
            modelEnable(top_3d_render_jthis,!visible,true);
        }
    })

    

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

function modelEnable(jthis,visible, send)
{
    classroomInfo.share3D = visible;
    if (visible) {
        _3dcanvas.show();
        //_3dcanvas.style.display = 'inline-block';
        CanvasResize();
        jthis.addClass('top_3d_on');
        jthis.removeClass('top_3d_off')
    }
    else {
        _3dcanvas.hide();
        jthis.addClass('top_3d_off');
        jthis.removeClass('top_3d_on')
    }
    if (send == true) {
        connection.send({
            modelEnable: { enable: visible }
        });
    }
}

function CanvasResize() {
    var frame = document.getElementById("widget-container").getElementsByTagName('iframe')[0].contentWindow;
    var canvas = frame.document.getElementById("main-canvas")
    var r = document.getElementsByClassName("lwindow")[0];
    var rwidth = $(r).width();
    _3dcanvas.attr("width", canvas.width - rwidth - 50);
    _3dcanvas.attr("height", canvas.height - 60);
}

function set3DModelStateData(_newPosition, _newRotation) {
    newPosition = _newPosition;
    newRotation = _newRotation;
}