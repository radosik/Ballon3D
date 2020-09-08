import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';




window.onload = function() {
    // rotate speed
    var speed = 0.2;

    // container for animation
    var wrapper3D = "bullons";

    // control button
    var buttonRight = "right";
    var buttonLeft = "left";

    // array of models
    var objects3D = [
        './ballon_big/ballon_big.gltf',
        './shar/shar.gltf',
        './avto/avto.gltf'
    ]

    // start iten index for array of models
    var active = 0;

    // background 
    var background3D = 0xffffff;

    // array of animate models
    var activate = [ 0, 2, 1, 2, 0, 1 ];

    // animate delay;
    var delay = 1500;

    /*****************************************************************************/

    var container, parent3D;
    var camera, scene, renderer;
    var objMesh = [];

    container = document.createElement('div');
    container.id = 'wrapperAnimation';
    var parent3D = document.getElementById(wrapper3D);
    parent3D.appendChild(container);

    var buttonRight3D = document.getElementById(buttonRight);
    var buttonLeft3D = document.getElementById(buttonLeft);

    buttonLeft3D.style.display = 'none';        
    buttonRight3D.style.display = 'none';

    camera = new THREE.PerspectiveCamera(45, parent3D.offsetWidth / parent3D.offsetHeight, 0.25, 2000);
    camera.position.set(0, 11, 25);
    camera.rotation.x = -0.1;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(background3D);


    var loader = new GLTFLoader();

    objects3D.forEach(function(item, index) {
        loader.load(item, function(gltf) {
            objMesh[index] = gltf.scene;
            if (index == active) {
                scene.add(gltf.scene);
                render();
            }
        });
    });

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {color: 0x575757} );

    var cube = new THREE.Mesh( geometry, material );
    cube.position.y = 16;
    cube.scale.x = 2.6;
    cube.scale.y = 0.05;
    scene.add( cube );

    var cube2 = new THREE.Mesh( geometry, material );
    cube2.position.y = 15;
    cube2.scale.x = 5.25;
    cube2.scale.y = 0.05;
    scene.add( cube2 );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(parent3D.offsetWidth, parent3D.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    var directionalLight = new THREE.DirectionalLight(0xfff9ed, 2);
    var targetObject = new THREE.Object3D();
    scene.add(targetObject);

    directionalLight.target = targetObject;
    directionalLight.position.set(12, 2, 5);
    scene.add(directionalLight);

    var directionalLight2 = new THREE.DirectionalLight(0xfff9ed, 2);
    directionalLight2.target = targetObject;
    directionalLight2.position.set(-12, 2, 5);
    scene.add(directionalLight2);

    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    var isTurn = false;
    var isRotate = true;

    var rotateRequest = false;
    var timeId;

    function speedFunc(rad) {
        return Math.sin(Math.acos(rad / 6.28))
    }

    function rotateRight() {
        if (active == objMesh.length - 1 && objMesh[active].rotation.y == 0) return false;
        if (objMesh[active].rotation.y > 3.14 && !isTurn) {
            scene.remove(objMesh[active]);
            var prev = objMesh[active].rotation.y;
            active += 1;
            if (active == objMesh.length - 1) {
                buttonRight3D.style.display = 'none';
            } else {
                buttonLeft3D.style.display = 'block';
            }
            objMesh[active].rotation.y = prev;
            scene.add(objMesh[active]);
            isTurn = true;
        }
        if (objMesh[active].rotation.y < 6.28) {
            requestAnimationFrame(rotateRight);
            objMesh[active].rotation.y += speed * speedFunc(objMesh[active].rotation.y);
            cube.rotation.y = objMesh[active].rotation.y;
            cube2.rotation.y = objMesh[active].rotation.y;
            isRotate = false;
            render();
        } else {
            isRotate = true;
            objMesh[active].rotation.y = 0;
            isTurn = false;
        }
        return true;
    }

    function rotateLeft() {
        if (active == 0 && objMesh[active].rotation.y == 0) return false;
        if (objMesh[active].rotation.y < -3.14 && !isTurn) {
            var prev = objMesh[active].rotation.y;
            scene.remove(objMesh[active]);
            active -= 1;
            if (active == 0) {
                buttonLeft3D.style.display = 'none';
            } else {
                buttonRight3D.style.display = 'block';
            }
            scene.add(objMesh[active]);
            objMesh[active].rotation.y = prev;
            isTurn = true;        
        }
        if (objMesh[active].rotation.y > -6.28) {
            requestAnimationFrame(rotateLeft);
            objMesh[active].rotation.y -= speed * speedFunc(objMesh[active].rotation.y);
            cube.rotation.y = objMesh[active].rotation.y
            cube2.rotation.y = objMesh[active].rotation.y
            isRotate = false;
            render();
        } else {
            isRotate = true; 
            objMesh[active].rotation.y = 0;
            isTurn = false;  
        }
        return true;
    }

    var indexAuto = 0;
    var activeAuto = activate[0];

    function changeMiddle() {
        scene.remove(objMesh[activeAuto]);
        var prev = objMesh[activeAuto].rotation.y;
        activeAuto = activate[indexAuto + 1];
        objMesh[activeAuto].rotation.y = prev;
        scene.add(objMesh[activeAuto]);
        isTurn = true;
    }

    function rotateAuto() {
        if (objMesh[activeAuto].rotation.y > 3.14 && !isTurn && indexAuto < activate.length) {
            changeMiddle();
        } 
        if (objMesh[activeAuto].rotation.y < 6.28 && indexAuto < activate.length - 1) {        
            requestAnimationFrame(rotateAuto);
            var delta = speed * speedFunc(objMesh[activeAuto].rotation.y);
            objMesh[activeAuto].rotation.y += delta;
            cube.rotation.y = objMesh[activeAuto].rotation.y;
            cube2.rotation.y = objMesh[activeAuto].rotation.y;
            isRotate = false;
            render();
        } else {
            isRotate = true;
            indexAuto++;        
            objMesh[activeAuto].rotation.y = 0;
            isTurn = false;
        }
        return true;
    }

    render();

    function render() {
        renderer.render(scene, camera);
    }

    setTimeout(
        function() {
            timeId = setInterval(function() {
                if (isRotate) {
                    if (indexAuto == activate.length) {
                        clearInterval(timeId);
                        active = 1;
                        buttonLeft3D.style.display = 'block';        
                        buttonRight3D.style.display = 'block';                      
                        buttonRight3D.addEventListener('click', rotateRight);
                        buttonLeft3D.addEventListener('click', rotateLeft);                                      
                    } else {
                        rotateAuto();
                    }
                }
            }, delay);
    },1000);
};

