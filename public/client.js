// import * as THREE from 'three';

// Connexion au serveur Socket.IO
const socket = io();

/* Initialisation de la scène Three.js *//////////////////////////////////////////////////////////////////////////////////////

// Création de la scène Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Liste des cubes joueurs et colliders
const players = {};
const serverPlayersClient = {};
const colliders = {};
const walls = {};

// Création d'un plan au sol
const geometryPlan = new THREE.PlaneGeometry(20, 40);
const materialPlan = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometryPlan, materialPlan);
plane.rotation.x = -Math.PI / 2; // Rotation pour que le plan soit horizontal
scene.add(plane);

// Création d'une ligne blanche centrale sur le plan
const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth : 5});
const points = [];
points.push(new THREE.Vector3(-9.9, 0.1, 0)); // Ajuster la position de la ligne
points.push(new THREE.Vector3(9.9, 0.1, 0)); // Ajuster la position de la ligne
const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometryLine, materialLine);
scene.add(line);

// Création d'un cercle central sur le plan
const geometryCircle = new THREE.RingGeometry(4.9, 5, 32); // Rayon intérieur de 4.9 unités, rayon extérieur de 5 unités, 32 segments
const materialCircle = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const circle = new THREE.Mesh(geometryCircle, materialCircle);
circle.rotation.x = -Math.PI / 2; // Rotation pour que le cercle soit horizontal
circle.position.set(0, 0.1, 0); // Positionner le cercle légèrement au-dessus du plan pour éviter le z-fighting
scene.add(circle);

// Création des buts
function createGoal(x, z) {
    const postMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Poteaux
    const postGeometry = new THREE.BoxGeometry(0.2, 2.44, 0.2); // Largeur, hauteur, profondeur
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(x - 3.66, 1.22, z); // Positionner le poteau gauche
    scene.add(leftPost);
    
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(x + 3.66, 1.22, z); // Positionner le poteau droit
    scene.add(rightPost);
    
    // Barre transversale
    const barGeometry = new THREE.BoxGeometry(0.2, 0.2, 7.32); // Largeur, hauteur, profondeur
    const crossbar = new THREE.Mesh(barGeometry, postMaterial);
    crossbar.position.set(x, 2.44, z); // Positionner la barre transversale
    crossbar.rotation.y = -Math.PI / 2; // Rotation de 90 degrés
    scene.add(crossbar);
}

// Ajouter les buts aux deux extrémités du terrain
createGoal(0, -20); // But à une extrémité
createGoal(0, 20); // But à l'autre extrémité

// Création des surfaces de collision invisibles en bordure du terrain
function createCollisionSurface(x, z, width, height, depth, id_wall) {
    const collisionGeometry = new THREE.BoxGeometry(width, height, depth);
    const collisionMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const collisionSurface = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collisionSurface.position.set(x, height / 2, z); // Positionner la surface de collision
    const wallCollider = new THREE.Box3().setFromObject(collisionSurface);
    walls[id_wall] = wallCollider;
    scene.add(collisionSurface);
}

// Ajouter les surfaces de collision autour du terrain
createCollisionSurface(0, -20, 20, 2, 0.5, 1); // Surface de collision en bas
createCollisionSurface(0, 20, 20, 2, 0.5, 2); // Surface de collision en haut
createCollisionSurface(-10, 0, 0.5, 2, 40, 3); // Surface de collision à gauche
createCollisionSurface(10, 0, 0.5, 2, 40, 4); // Surface de collision à droite

// Positionner la caméra au-dessus du centre du plan
camera.position.set(-10, 20, 0); // Positionner la caméra au-dessus du centre du plan
camera.lookAt(0, 0, 0); // La caméra regarde vers le centre du plan
camera.rotation.z = -Math.PI / 2; // Rotation de 180 degrés 

/* Initialisation des items dynamiques *//////////////////////////////////////////////////////////////////////////////////////

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
// Création de la balle au milieu du terrain
function createBall() {
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Rayon de 0.5 unités, 32 segments horizontaux et verticaux
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0.5, 0); // Positionner la balle au centre du terrain
    scene.add(ball);
    
    // Créer un collider (bounding sphere) pour la balle
    const ballCollider = new THREE.Box3().setFromObject(ball); // j'ai pas réussi autrement
    colliders['ball'] = ballCollider;
    return ball;
}
// Ajouter la balle à la scène
const ball = createBall();


/* Gestion des événements Socket.IO *//////////////////////////////////////////////////////////////////////////////////////

const pseudonym = prompt("Entrez votre pseudonyme :");
socket.emit('newPlayer', { pseudonym });

// Initialisation des joueurs lorsque la connexion est établie
socket.on('init', (serverPlayers) => {
    for (let id in serverPlayers) {
        players[id] = createPlayerCube(serverPlayers[id]);
        serverPlayersClient[id] = serverPlayers[id];
    }
    updatePlayerList(serverPlayersClient);
});


// Ajout d'un nouveau joueur
socket.on('newPlayer', (player) => {
    players[player.id] = createPlayerCube(player);
    serverPlayersClient[player.id] = player;
    updatePlayerList(serverPlayersClient);
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
        delete serverPlayersClient[id];
        updatePlayerList(serverPlayersClient);
    }
});

function updatePlayerList(playersList) {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = ''; // Vider la liste actuelle

    Object.keys(playersList).forEach((id) => {
        const player = playersList[id];
        console.log(player);
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

// Contrôle du joueur local (utilisation des touches de direction)
const moveSpeed = 0.1;
document.addEventListener('keydown', (event) => {
    const player = players[socket.id];
    if (player) {
        let prevPosition = player.position.clone(); // Stocker l'ancienne position


        if (event.key === 'ArrowUp') player.position.x += moveSpeed;
        if (event.key === 'ArrowDown') player.position.x -= moveSpeed;
        if (event.key === 'ArrowLeft') player.position.z -= moveSpeed;
        if (event.key === 'ArrowRight') player.position.z += moveSpeed;


        // Mettre à jour le collider du joueur
        colliders[socket.id].setFromObject(player);


        // Vérifier les collisions avec les autres joueurs
        let collisionDetected = false;
        for (let id in colliders) {
            if (id !== socket.id && colliders[socket.id].intersectsBox(colliders[id]) && id !== 'ball'){
                collisionDetected = true;
                break;
            }
        }
        for (let id in walls) {
            if (walls[id].intersectsBox(colliders[socket.id])) {
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

        // Vérifier les collisions avec la balle
        if (colliders[socket.id].intersectsBox(colliders['ball'])) {
            // Si collision avec la balle, déplacer la balle en fonction du mouvement du joueur
            ball.position.x += player.position.x - prevPosition.x;
            ball.position.z += player.position.z - prevPosition.z;
            colliders['ball'].setFromObject(ball);
            
        }

    }
});

// Fonction de rendu
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();