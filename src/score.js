 import { scene } from './scene.js';

export const score = { left: 0, right: 0 };
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

export function createScoreSprite() {
    const texture = createTextTexture('Score: 0 - 0');
    const material = new THREE.SpriteMaterial({ map: texture });
    scoreSprite = new THREE.Sprite(material);
    scoreSprite.scale.set(10, 5, 1); // Adjust the scale as needed
    scoreSprite.position.set(0, 20, -30); // Position the score at the top of the screen
    scene.add(scoreSprite);
}

export function updateScore(left, right) {
    score.left = left;
    score.right = right;
    const texture = createTextTexture(`Score: ${score.left} - ${score.right}`);
    scoreSprite.material.map = texture;
    scoreSprite.material.needsUpdate = true;
}