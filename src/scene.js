export function createScene() {
    const scene = new THREE.Scene();
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

function createCollisionSurface(x, z, width, height, depth, scene) {
    const collisionGeometry = new THREE.BoxGeometry(width, height, depth);
    const collisionMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const collisionSurface = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collisionSurface.position.set(x, height / 2, z); // Positionner la surface de collision
    const wallCollider = new THREE.Box3().setFromObject(collisionSurface);
    scene.add(collisionSurface);

    return wallCollider
}

export function createObjects(scene) {
    const geometryPlan = new THREE.PlaneGeometry(20, 40);
    const materialPlan = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
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

    const scoreSprite = createScoreSprite(`${0} - ${0}`);
    scoreSprite.position.set(0, 12, 1);
    scene.add(scoreSprite);
    
    let walls = {};
    // Ajouter les surfaces de collision autour du terrain
    walls['bot'] = createCollisionSurface(0, -20, 20, 2, 0.5, scene); // Surface de collision en bas
    walls['top'] = createCollisionSurface(0, 20, 20, 2, 0.5, scene); // Surface de collision en haut
    walls['gauche'] = createCollisionSurface(-10, 0, 0.5, 2, 40, scene); // Surface de collision à gauche
    walls['droite'] = createCollisionSurface(10, 0, 0.5, 2, 40, scene); // Surface de collision à droite

    return { plane, line, circle, scoreSprite, walls };
}

export function createGoals(scene) {
    function createGoal(x, z) {
        const postMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Poteaux
        const postGeometry = new THREE.BoxGeometry(0.2, 2.44, 0.2);
        const leftPost = new THREE.Mesh(postGeometry, postMaterial);
        leftPost.position.set(x - 3.66, 1.22, z);
        scene.add(leftPost);

        const rightPost = new THREE.Mesh(postGeometry, postMaterial);
        rightPost.position.set(x + 3.66, 1.22, z);
        scene.add(rightPost);

        // Barre transversale
        const barGeometry = new THREE.BoxGeometry(0.2, 0.2, 7.32);
        const crossbar = new THREE.Mesh(barGeometry, postMaterial);
        crossbar.position.set(x, 2.44, z);
        crossbar.rotation.y = -Math.PI / 2;
        scene.add(crossbar);
    }

    // Ajouter les buts aux deux extrémités du terrain
    createGoal(0, -20); // But à une extrémité
    createGoal(0, 20); // But à l'autre extrémité
}

function createScoreSprite(text) {
    const texture = createTextTexture(text);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 5, 1);
    return sprite;
}

function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `64px Arial`;
    context.fillStyle = 'white';
    context.fillText(text, 0, 64);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
