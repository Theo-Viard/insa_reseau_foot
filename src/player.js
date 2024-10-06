import {resetBall} from './ball.js'
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';

export function createPlayerCube(playerData, scene, world) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: playerData.color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(playerData.x, playerData.y, playerData.z);
    scene.add(cube);
    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const playerMaterial = new CANNON.Material({ friction: 0.05, restitution: 0.5 });  
    const playerBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(playerData.x, playerData.y, playerData.z),
        shape: shape,
        material: playerMaterial  
    });
    world.addBody(playerBody);

    cube.userData.physicsBody = playerBody;

    return cube;
}

export function updatePlayerMovement(players, ball, keysPressed, colliders, moveSpeed, socket, walls) {
    const player = players[socket.id];  
    if (!player) return;

    const playerBody = player.userData.physicsBody;
    const velocity = new CANNON.Vec3(0, 0, 0); 

    // Contrôle des mouvements
    if (keysPressed['ArrowUp']) {
        velocity.x -= moveSpeed;
    }
    if (keysPressed['ArrowDown']) {
        velocity.x += moveSpeed;  
    }
    if (keysPressed['ArrowLeft']) {
        velocity.z -= moveSpeed;  
    }
    if (keysPressed['ArrowRight']) {
        velocity.z += moveSpeed;  
    }

    // Appliquer la vitesse au corps physique du joueur
    if (!velocity.almostZero()) {
        playerBody.velocity.set(velocity.x, playerBody.velocity.y, velocity.z);  
    }

    // Mettre à jour la position du joueur en fonction de la physique
    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);
}