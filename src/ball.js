import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export function createBall(ballData, scene, colliders, world) {
    
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: ballData.color });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(ballData.x, ballData.y, ballData.z);
    scene.add(ball);
    // Création du corps physique de la balle
    const ballShape = new CANNON.Sphere(0.5);
    const ballMaterialPhys = new CANNON.Material({ friction: 0.1, restitution: 0.9 }); 
    const ballBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(ballData.x, ballData.y, ballData.z),
        shape: ballShape,
        material: ballMaterialPhys
    });

    world.addBody(ballBody);

    const ballCollider = new THREE.Box3().setFromObject(ball);
    colliders['ball'] = ballCollider;

    return { ball, ballBody };
}

export function updateBallPosition(ball, ballBody) {
    // ball.quaternion.copy(ballBody.quaternion);
}

export function resetBall(ball, ballBody, colliders) {
    if (ball && ballBody) {
        console.log('Resetting ball position');
        ballBody.position.set(0, 0.5, 0);
        ballBody.velocity.set(0, 0, 0);
        ballBody.angularVelocity.set(0, 0, 0);
        ball.position.copy(ballBody.position);
        colliders['ball'].setFromObject(ball);
    } else {
        console.log('Ball or ballBody is not defined');
    }
}