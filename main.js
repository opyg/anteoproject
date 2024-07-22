import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';
// main.js


// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(5.6, 2.9, 2.6);
camera.lookAt(-1, -1, 3);

scene.background = new THREE.Color(0xdfffff); // Set the background color to white

renderer.render(scene, camera);

// Box
const box_geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const box_material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const box = new THREE.Mesh(box_geometry, box_material);
box.position.set(0.6, 0.6, 0.6);
scene.add(box);

// Array to store all draggable objects
const draggableObjects = [box];

function createParallelepiped([x, y, z, width, height, depth]) {
  const geometry = new THREE.BoxGeometry(width / 100, height / 100, depth / 100);
  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xffffff,
    transparent: true,
    opacity: 0.7
  });
  const parallelepiped = new THREE.Mesh(geometry, material);
  parallelepiped.position.set(x / 100 + width / 200, y / 100 + height / 200, z / 100 + depth / 200);

  scene.add(parallelepiped);
  draggableObjects.push(parallelepiped);
}
const parallelepipeds = [
    [0, 0, 0, 80, 80, 60],  
    [80, 0, 0, 80, 80, 60], 
    [160, 0, 0, 80, 80, 60], 
    [0, 80, 0, 80, 80, 60],  
    [80, 80, 0, 80, 80, 60], 
    [160, 80, 0, 80, 80, 60],
    [0, 160, 0, 80, 80, 60], 
    [80, 160, 0, 80, 80, 60],
    [160, 160, 0, 80, 80, 60],
    [0, 0, 60, 80, 80, 60],  
    [0, 0, 120, 20, 30, 40],
    [20, 0, 120, 20, 30, 40],
    [40, 0, 120, 20, 30, 40],
    [60, 0, 120, 20, 30, 40],
    [80, 0, 120, 20, 30, 40],
    [0, 30, 120, 20, 30, 40],
    [20, 30, 120, 20, 30, 40],
    [40, 30, 120, 20, 30, 40],
    [60, 30, 120, 20, 30, 40],
    [80, 30, 120, 20, 30, 40],
    [0, 60, 120, 20, 30, 40],
    [20, 60, 120, 20, 30, 40],
    [40, 60, 120, 20, 30, 40],
    [60, 60, 120, 20, 30, 40],
    [80, 60, 120, 20, 30, 40],
    [0, 90, 120, 20, 30, 40],
    [20, 90, 120, 20, 30, 40],
    [40, 90, 120, 20, 30, 40],
    [60, 90, 120, 20, 30, 40],
    [80, 90, 120, 20, 30, 40] 
];
parallelepipeds.forEach(createParallelepiped);

// Cube
const geometry = new THREE.BoxGeometry(3, 3 , 8);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: true
});
const cube = new THREE.Mesh(geometry, material);

const edgesGeometry = new THREE.EdgesGeometry(cube.geometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xff, linewidth: 3 });
const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

const group = new THREE.Group();
group.add(cube);
group.add(edges);
group.position.set(geometry.parameters.width / 2, geometry.parameters.height / 2, geometry.parameters.depth / 2);

scene.add(group);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper);

// Variables to store mouse state
let isDragging = false;
let isPanning = false;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let intersectedObject = null;
let previousMousePosition = {
  x: 0,
  y: 0
};

// Function to check collision
function checkCollision(obj1, obj2) {
  const box1 = new THREE.Box3().setFromObject(obj1);
  const box2 = new THREE.Box3().setFromObject(obj2);
  return box1.intersectsBox(box2);
}

// Event listener for mouse down
window.addEventListener('mousedown', (event) => {
  if (event.button === 0) { // Left button
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(draggableObjects);
    if (intersects.length > 0) {
      isDragging = true;
      intersectedObject = intersects[0].object;
      intersectedObject.material.opacity = 0.5; // Make it semi-transparent while dragging
    }
  } else{ 
    isPanning = true;
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }
});

// Event listener for mouse up
window.addEventListener('mouseup', () => {
  if (intersectedObject) {
    intersectedObject.material.opacity = 1; // Restore opacity
  }
  isDragging = false;
  intersectedObject = null;
  isPanning = false;
});


// Event listener for mouse move
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (isDragging && intersectedObject) {
    // Convert mouse coordinates to 3D coordinates
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const newPosition = intersect.point;

      // Calculate container boundaries
      const containerMinX = (cube.position.x) + intersectedObject.geometry.parameters.width / 2;
      const containerMaxX = (cube.position.x + geometry.parameters.width) - intersectedObject.geometry.parameters.width / 2;
      const containerMinY = (cube.position.y) + intersectedObject.geometry.parameters.height / 2;
      const containerMaxY = (cube.position.y + geometry.parameters.height) - intersectedObject.geometry.parameters.height / 2;
      const containerMinZ = (cube.position.z) + intersectedObject.geometry.parameters.depth / 2;
      const containerMaxZ = (cube.position.z + geometry.parameters.depth) - intersectedObject.geometry.parameters.depth /2;

      // Clamp the new position within the container boundaries
      newPosition.x = THREE.MathUtils.clamp(newPosition.x, containerMinX, containerMaxX);
      newPosition.y = THREE.MathUtils.clamp(newPosition.y, containerMinY, containerMaxY);
      newPosition.z = THREE.MathUtils.clamp(newPosition.z, containerMinZ, containerMaxZ);

      const originalPosition = intersectedObject.position.clone();
      intersectedObject.position.copy(newPosition);

      let hasCollision = false;
      for (const obj of draggableObjects) {
        if (obj !== intersectedObject && checkCollision(intersectedObject, obj)) {
          hasCollision = true;
          break;
        }
      }
      if (hasCollision) {
        intersectedObject.position.copy(originalPosition);
      } else {
        let max_y = 0;
        let count = 0;
        // Check the surface under the object
        
        
        for(let w = -(intersectedObject.geometry.parameters.width/2); w <= intersectedObject.geometry.parameters.width/2; w += intersectedObject.geometry.parameters.width) {
          for(let d = -(intersectedObject.geometry.parameters.depth/2); d <= intersectedObject.geometry.parameters.depth/2; d += intersectedObject.geometry.parameters.depth) {
            let btmPoint = new THREE.Vector3(newPosition.x + w, newPosition.y - intersectedObject.geometry.parameters.height/2, newPosition.z + d);
            raycaster.set(btmPoint, new THREE.Vector3(0, -1, 0));
            const groundIntersects = raycaster.intersectObjects(draggableObjects);
            if (groundIntersects.length > 0) {
              count++;
              const groundIntersect = groundIntersects[0]
              if(groundIntersect.point.y > max_y){
                max_y = groundIntersect.point.y;
              }
            
            }
        
          }
        } 
        raycaster.set(newPosition, new THREE.Vector3(0, -1, 0));
        const groundIntersects = raycaster.intersectObjects(draggableObjects);
        if (groundIntersects.length > 0) {
          count++;
          const groundIntersect = groundIntersects[0]
          if(groundIntersect.point.y > max_y){
            max_y = groundIntersect.point.y;
          }
        }
        if (count != 0) {
          newPosition.y = max_y + intersectedObject.geometry.parameters.height / 2;
        } else {
          // Move the object to the floor of the container
          newPosition.y = containerMinY;
        }

        new TWEEN.Tween(intersectedObject.position)
          .to(newPosition, 400) // Smooth transition duration
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }
    }
  } else if (isPanning) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    const angleY = deltaX * 0.005;
    const angleX = deltaY * 0.005;

    camera.position.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleY));
    camera.position.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angleX));
    
    camera.lookAt(group.position);
    console.log(camera.position);
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }
});

const minDistance = 1;
const maxDistance = 30;
window.addEventListener('wheel', function(event) {
  const zoomIntensity = 0.005;
  const zoom = -(event.deltaY * zoomIntensity);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.normalize();

  camera.position.addScaledVector(direction, zoom);

  if (camera.position.length() < minDistance) {
    camera.position.setLength(minDistance);
  } else if (camera.position.length() > maxDistance) {
    camera.position.setLength(maxDistance);
  }
});

// Prevent context menu on right-click
window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  TWEEN.update(); // Update tween animations
  renderer.render(scene, camera);
}

animate();
