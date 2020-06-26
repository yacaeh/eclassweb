var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

    // Add and manipulate meshes in the scene
    //var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    //var myBox = BABYLON.MeshBuilder.CreateBox("myBox", { height: 5, width: 2, depth: 0.5 }, scene);

    // BABYLON.SceneLoader.ImportMesh("GazAA", "./assets/models/dump/", "GazAA.glb", scene, function(object) {
    //     // You can apply properties to object.
    //     object.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    // });


   

    BABYLON.SceneLoader.ImportMesh("","./assets/models/scenes/", "skull.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        camera.target = newMeshes[0];
    });

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

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});