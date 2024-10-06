import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

import { createScene, createRenderer, createCamera, createObjects, createGoals, createGround } from './scene.js';
import { updatePlayerMovement } from './player.js';
import { createBall, updateBallPosition } from './ball.js';
import { initSocket, handleSocketEvents } from './socket.js';
const keysPressed = {}; 

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); 
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 20;  
world.solver.tolerance = 0.001;

const scene = createScene();
const renderer = createRenderer();
const camera = createCamera();
document.body.appendChild(renderer.domElement);
const moveSpeed = 0.1;
// Créer le sol et les objets
const { plane, groundBody } = createGround(scene, world);  
const { plane: plane2, line, circle, scoreSprite, walls } = createObjects(scene);
createGoals(scene);

let players = {};
let ball = null;
let colliders = {};

// Matériaux pour les contacts balle-sol
const groundMaterial = groundBody.material;  
const ballMaterial = new CANNON.Material(); 
const ballGroundContactMaterial = new CANNON.ContactMaterial(
    groundMaterial, ballMaterial, { friction: 0.4, restitution: 0.3 }
);
world.addContactMaterial(ballGroundContactMaterial);  

// Fonction pour mettre à jour la liste des joueurs
function updatePlayerList(players) {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = '';  

    Object.keys(players).forEach((id) => {
        const player = players[id];
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.style.backgroundColor = player.color;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = player.pseudonym;

        playerDiv.appendChild(colorDiv);
        playerDiv.appendChild(nameDiv);
        playerListDiv.appendChild(playerDiv);
    });
}

// Initialiser le socket et récupérer l'ID du joueur
const socket = initSocket(players, colliders, scene, world, (ballData) => {
    const ballObject = createBall(ballData, scene, colliders, world);  
    ball = ballObject.ball;
    ball.userData.physicsBody = ballObject.ballBody;
}, updatePlayerList);

handleSocketEvents(socket, players, colliders, scene, (data) => {
    updateBallPosition(data, ball);
}, updatePlayerList, () => ball);

document.addEventListener('keydown', (event) => keysPressed[event.key] = true);
document.addEventListener('keyup', (event) => keysPressed[event.key] = false);

function animate() {
    requestAnimationFrame(animate);
    const timeStep = 1 / 60;
    world.step(timeStep);

    // Mettez à jour le mouvement du joueur
    updatePlayerMovement(players, ball, keysPressed, colliders, moveSpeed, socket, walls); 

    // Synchroniser les joueurs
    Object.values(players).forEach(player => {
        if (player && player.userData && player.userData.physicsBody) {
            player.position.copy(player.userData.physicsBody.position);
            player.quaternion.copy(player.userData.physicsBody.quaternion);
        }
    });

    // Synchroniser la balle
    if (ball && ball.userData && ball.userData.physicsBody) {
        ball.position.copy(ball.userData.physicsBody.position);
        ball.quaternion.copy(ball.userData.physicsBody.quaternion);
    }

    // Render la scène
    renderer.render(scene, camera);
}
animate();
