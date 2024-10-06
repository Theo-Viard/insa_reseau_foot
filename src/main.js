import { createScene, createRenderer, createCamera, createObjects, createGoals } from './scene.js';
import { createPlayerCube, updatePlayerMovement } from './player.js';
import { createBall, updateBallPosition } from './ball.js';
import { initSocket, handleSocketEvents } from './socket.js';

const scene = createScene();
const renderer = createRenderer();
const camera = createCamera();
document.body.appendChild(renderer.domElement);

const { plane, line, circle, scoreSprite, walls } = createObjects(scene);

createGoals(scene);

let players = {};
let ball = null;  // Définir la variable de la balle ici
let colliders = {};  // Colliders pour chaque joueur et la balle
const moveSpeed = 0.05;
const keysPressed = {};

// Initialiser le socket et récupérer l'ID du joueur
const socket = initSocket(players, colliders, scene, (ballData) => {
    ball = createBall(ballData, scene, colliders);  // Créer la balle lorsque l'événement ballInit est reçu
}, updatePlayerList);

// Gérer les événements liés aux autres joueurs
handleSocketEvents(socket, players, colliders, scene, (data) => {
    updateBallPosition(data, ball);  // Passer l'instance de la balle ici
}, updatePlayerList);

document.addEventListener('keydown', (event) => keysPressed[event.key] = true);
document.addEventListener('keyup', (event) => keysPressed[event.key] = false);


// Fonction pour mettre à jour la liste des joueurs
function updatePlayerList(players) {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = '';  // Vider la liste actuelle

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


function animate() {
    requestAnimationFrame(animate);
    updatePlayerMovement(players, ball, keysPressed, colliders, moveSpeed, socket, walls);  // Passer socket ici
    renderer.render(scene, camera);
}
animate();
