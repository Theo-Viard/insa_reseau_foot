export function createPlayerCube(playerData, scene, colliders) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: playerData.color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(playerData.x, playerData.y, playerData.z);
    scene.add(cube);

    // Créer le collider pour ce joueur
    const collider = new THREE.Box3().setFromObject(cube);
    colliders[playerData.id] = collider;

    return cube;
}

export function updatePlayerMovement(players, ball, keysPressed, colliders, moveSpeed, socket, walls) {
    const player = players[socket.id];  // Utiliser l'ID du joueur pour se déplacer uniquement lui
    if (!player) return;

    const prevPosition = player.position.clone();
    let movementDetected = false;

    if (keysPressed['ArrowUp']) {
        player.position.x += moveSpeed;
        movementDetected = true;
    }
    if (keysPressed['ArrowDown']) {
        player.position.x -= moveSpeed;
        movementDetected = true;
    }
    if (keysPressed['ArrowLeft']) {
        player.position.z -= moveSpeed;
        movementDetected = true;
    }
    if (keysPressed['ArrowRight']) {
        player.position.z += moveSpeed;
        movementDetected = true;
    }

    if (movementDetected) {
       // Mettre à jour le collider du joueur
       colliders[socket.id].setFromObject(player);

       // Vérifier les collisions avec les autres joueurs
       let collisionDetected = false;
       for (let id in colliders) {
           if (id !== socket.id && colliders[socket.id].intersectsBox(colliders[id]) && id !== 'ball') {
               collisionDetected = true;
               break;
           }
       }

       // Vérifier les collisions avec les murs
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
           socket.emit('moveBall', { x: ball.position.x, y: ball.position.y, z: ball.position.z });
       }
   }
}