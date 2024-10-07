import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
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

    // Limiter les rotations
    playerBody.fixedRotation = true;
    playerBody.updateMassProperties();

    // Limiter les mouvements sur l'axe vertical
    playerBody.position.y = 0.5;
    playerBody.velocity.y = 0;
    playerBody.angularVelocity.set(0, 0, 0);

    playerBody.velocity.set(0, 0, 0);
    playerBody.angularVelocity.set(0, 0, 0);


    world.addBody(playerBody);

    cube.userData.physicsBody = playerBody;

    return cube;
}
let speed = 15;
export function updatePlayerMovement(players, ball, keysPressed, colliders, moveSpeed, socket, walls) {
    const player = players[socket.id];
    if (!player) return;

    const playerBody = player.userData.physicsBody;
    const velocity = new CANNON.Vec3(0, 0, 0);

    // Contrôle des mouvements
    if (keysPressed['ArrowUp']) {
        velocity.x += speed;
    }
    if (keysPressed['ArrowDown']) {
        velocity.x -= speed;
    }
    if (keysPressed['ArrowLeft']) {
        velocity.z -= speed;
    }
    if (keysPressed['ArrowRight']) {
        velocity.z += speed;
    }
    // Accélération de la vitesse si la touche Maj est enfoncée
    if (keysPressed['Shift']) {
        if (speed < 30) {
            speed += 0.05;
        }
    }
    else {
        speed = 15;
    }


    // Appliquer la vitesse au corps physique du joueur
    if (!velocity.almostZero()) {
        playerBody.velocity.set(velocity.x, playerBody.velocity.y, velocity.z);

        // Émettre l'événement de mouvement du joueur
        socket.emit('move', {
            id: player.id,
            x: playerBody.position.x,
            y: playerBody.position.y,
            z: playerBody.position.z,
            vx: playerBody.velocity.x,
            vy: playerBody.velocity.y,
            vz: playerBody.velocity.z
        });
    }

    // Mettre à jour la position du joueur en fonction de la physique
    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);
}