let Ball = null;

export function createBall(ballData, scene, colliders) {
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: ballData.color });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(ballData.x, ballData.y, ballData.z);
    scene.add(ball);

    // Créer le collider pour la balle
    const ballCollider = new THREE.Box3().setFromObject(ball);
    colliders['ball'] = ballCollider;

    Ball = ball;
    return ball;
}

export function getBallData() {
    return Ball;
}

export function updateBallPosition(data, ball) {
    ball.position.set(data.x, data.y, data.z);
    Ball = ball;
}