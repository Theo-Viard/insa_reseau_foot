// Connexion au serveur Socket.IO
const socket = io();


// Création de la scène Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Création d'un plan au sol
const geometry = new THREE.PlaneGeometry(20, 20);
const material = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI / 2;
scene.add(plane);


// Liste des cubes joueurs et colliders
const players = {};
const colliders = {};


// Création de cubes pour chaque joueur avec un collider
function createPlayerCube(player) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: player.color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(player.x, player.y, player.z);
    scene.add(cube);


    // Créer un collider (bounding box) pour ce cube 
    const collider = new THREE.Box3().setFromObject(cube);
    colliders[player.id] = collider;


    return cube;
}


// Initialisation des joueurs lorsque la connexion est établie
socket.on('init', (serverPlayers) => {
    for (let id in serverPlayers) {
        players[id] = createPlayerCube(serverPlayers[id]);
    }
});


// Ajout d'un nouveau joueur
socket.on('newPlayer', (player) => {
    players[player.id] = createPlayerCube(player);
});


// Mise à jour de la position des joueurs et des colliders
socket.on('playerMoved', (player) => {
    if (players[player.id]) {
        players[player.id].position.set(player.x, player.y, player.z);


        // Mettre à jour le collider du joueur déplacé
        colliders[player.id].setFromObject(players[player.id]);
    }
});


// Suppression d'un joueur déconnecté
socket.on('playerDisconnected', (id) => {
    if (players[id]) {
        scene.remove(players[id]);
        delete players[id];
        delete colliders[id]; // Supprimer également le collider
    }
});


// Contrôle du joueur local (utilisation des touches de direction)
const moveSpeed = 0.1;
document.addEventListener('keydown', (event) => {
    const player = players[socket.id];
    if (player) {
        let prevPosition = player.position.clone(); // Stocker l'ancienne position


        if (event.key === 'ArrowUp') player.position.z -= moveSpeed;
        if (event.key === 'ArrowDown') player.position.z += moveSpeed;
        if (event.key === 'ArrowLeft') player.position.x -= moveSpeed;
        if (event.key === 'ArrowRight') player.position.x += moveSpeed;


        // Mettre à jour le collider du joueur
        colliders[socket.id].setFromObject(player);


        // Vérifier les collisions avec les autres joueurs
        let collisionDetected = false;
        for (let id in colliders) {
            if (id !== socket.id && colliders[socket.id].intersectsBox(colliders[id])) {
                collisionDetected = true;
                break;
            }
        }


        // Si collision, annuler le mouvement
        if (collisionDetected) {
            player.position.copy(prevPosition);
        } else {
            // Envoi des nouvelles positions au serveur uniquement si pas de collision
            socket.emit('move', { x: player.position.x, z: player.position.z });
        }
    }
});


// Positionnement de la caméra
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);


// Fonction de rendu
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();