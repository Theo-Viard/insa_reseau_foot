import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export function createGround(scene, world) {
    const geometry = new THREE.PlaneGeometry(20, 40);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    // Création du corps physique du sol
    const groundShape = new CANNON.Plane();
    const groundMaterial = new CANNON.Material('groundMaterial');
    const groundBody = new CANNON.Body({
        mass: 0,
        material: groundMaterial
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    return { plane, groundBody };
}

export function createScene() {
    const scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();
    scene.background = loader.load( 'https://media.istockphoto.com/id/1502846052/fr/photo/terrain-textur%C3%A9-de-jeu-de-football-avec-le-brouillard-de-n%C3%A9on-centre-milieu-de-terrain.jpg?s=1024x1024&w=is&k=20&c=BRsvbxYMbiJrYSVxlwYnWVeiHqiRN5FpQTRkJdHt4Oc=' );
    return scene;
}

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-10, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.rotation.z = -Math.PI / 2;
    return camera;
}

function createCollisionSurface(x, z, width, height, depth, scene, world) {
    const collisionGeometry = new THREE.BoxGeometry(width, height, depth);
    const collisionMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const collisionSurface = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collisionSurface.position.set(x, height / 2, z);
    scene.add(collisionSurface);

    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const bodyMaterial = new CANNON.Material({ friction: 0.1, restitution: 0.7 }); 
    const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x, height / 2, z),
        shape: shape,
        material: bodyMaterial
    });
    world.addBody(body);

    return body;
}
// Création du terrain, des lignes du terrain et des murs
export function createObjects(scene, world) {
    const geometryPlan = new THREE.PlaneGeometry(20, 40);
    const materialPlan = new THREE.MeshBasicMaterial({ color: 0x52b14c, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometryPlan, materialPlan);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 });
    const points = [new THREE.Vector3(-9.9, 0.1, 0), new THREE.Vector3(9.9, 0.1, 0)];
    const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometryLine, materialLine);
    scene.add(line);

    const geometryCircle = new THREE.RingGeometry(4.9, 5, 32);
    const materialCircle = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(geometryCircle, materialCircle);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(0, 0.1, 0);
    scene.add(circle);

    const scoreSprite = createScoreSprite(scene);

    let walls = {};
    walls['gauche'] = createCollisionSurface(0, -20, 20, 2, 0.5, scene, world);
    walls['droite'] = createCollisionSurface(0, 20, 20, 2, 0.5, scene, world);
    walls['bot'] = createCollisionSurface(-10, 0, 0.5, 2, 40, scene, world);
    walls['top'] = createCollisionSurface(10, 0, 0.5, 2, 40, scene, world);

    return { plane, line, circle, scoreSprite, walls };
}
// Création des buts
export function createGoals(scene, world) {
    function createGoal(x, z) {
        const postMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const postGeometry = new THREE.BoxGeometry(0.2, 2.44, 0.2);
        const leftPost = new THREE.Mesh(postGeometry, postMaterial);
        leftPost.position.set(x - 3.66, 1.22, z);
        scene.add(leftPost);

        const rightPost = new THREE.Mesh(postGeometry, postMaterial);
        rightPost.position.set(x + 3.66, 1.22, z);
        scene.add(rightPost);

        const barGeometry = new THREE.BoxGeometry(0.2, 0.2, 7.32);
        const crossbar = new THREE.Mesh(barGeometry, postMaterial);
        crossbar.position.set(x, 2.44, z);
        crossbar.rotation.y = -Math.PI / 2;
        scene.add(crossbar);

        // Ajouter des colliders pour les poteaux et la barre transversale
        const postMaterialPhys = new CANNON.Material({ friction: 0.1, restitution: 0.7 }); 
        const leftPostShape = new CANNON.Box(new CANNON.Vec3(0.1, 1.22, 0.1));
        const leftPostBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x - 3.66, 1.22, z),
            shape: leftPostShape,
            material: postMaterialPhys
        });
        world.addBody(leftPostBody);

        const rightPostShape = new CANNON.Box(new CANNON.Vec3(0.1, 1.22, 0.1));
        const rightPostBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x + 3.66, 1.22, z),
            shape: rightPostShape,
            material: postMaterialPhys
        });
        world.addBody(rightPostBody);

        const crossbarShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 3.66));
        const crossbarBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x, 2.44, z),
            shape: crossbarShape,
            material: postMaterialPhys
        });
        world.addBody(crossbarBody);
    }

    createGoal(0, -20);
    createGoal(0, 20);
}

export let score = { left: 0, right: 0 };
let scoreSprite;

function createTextTexture(text, fontSize = 64, color = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px Arial`;
    context.fillStyle = color;
    context.fillText(text, 0, fontSize);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createScoreSprite(scene) {
    const texture = createTextTexture('0 - 0');
    const material = new THREE.SpriteMaterial({ map: texture });
    scoreSprite = new THREE.Sprite(material);
    scoreSprite.scale.set(10, 5, 1);
    scoreSprite.position.set(0, 12, 3);
    scene.add(scoreSprite);
}

export function updateScore(Score) {
    score = Score;
    const texture = createTextTexture(`${score.left} - ${score.right}`);
    scoreSprite.material.map = texture;
    scoreSprite.material.needsUpdate = true;
}