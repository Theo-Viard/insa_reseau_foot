export function createBall(ballData, scene, colliders) {
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: ballData.color });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(ballData.x, ballData.y, ballData.z);
    scene.add(ball);

    // Créer le collider pour la balle
    const ballCollider = new THREE.Box3().setFromObject(ball);
    colliders['ball'] = ballCollider;

    return ball;
}

export function getBallData() {
    return Ball;
}

export function updateBallPosition(data, ball) {
    console.log('Moving ball:', data);
    ball.position.set(data.x, data.y, data.z);
}

export function resetBall(ball, colliders) {
    if (ball) {
        console.log('Resetting ball position');
        ball.position.set(0, 0.5, 0); // Réinitialiser la position de la balle au centre
        colliders['ball'].setFromObject(ball); // Mettre à jour le collider de la balle
    } else {
        console.log('Ball is not defined');
    }
}