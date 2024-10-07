import { createPlayerCube } from './player.js';
import { updateScore } from './scene.js';
import { updateBallPosition, resetBall } from './ball.js';

let serverPlayersLocal = {};

export function initSocket(players, colliders, scene, world, onBallInit, updatePlayerList) {
    const socket = io();
    const pseudonym = prompt("Entrez votre pseudonyme :");

    socket.emit('newPlayer', { pseudonym });

    socket.on('init', (serverPlayers) => {
        Object.keys(serverPlayers).forEach(id => {
            if (!players[id]) {
                players[id] = createPlayerCube(serverPlayers[id], scene, world);
                serverPlayersLocal[id] = serverPlayers[id];
            }
        });

        updatePlayerList(serverPlayers);
    });

    socket.on('ballInit', (ballData) => {
        onBallInit(ballData);
    });

    socket.on('scoreInit', (score) => {
        updateScore(score);
    });

    socket.on('newPlayer', (player) => {
        if (!players[player.id]) {
            players[player.id] = createPlayerCube(player, scene, world);
            serverPlayersLocal[player.id] = player;
            updatePlayerList(serverPlayersLocal);
        }
    });

    return socket;
}

export function handleSocketEvents(socket, players, colliders, scene, onBallMoved, updatePlayerList, getBall) {
    socket.on('playerMoved', (data) => {
        if (players[data.id]) {
            const player = players[data.id];
            const body = player.userData.physicsBody;
            body.position.set(data.x, data.y, data.z);
            body.velocity.set(data.vx, data.vy, data.vz);
        }
    });

    // Écouter les mises à jour des mouvements de la balle
    socket.on('ballMoved', (data) => {
        const ball = getBall();
        try {
            ball.position.set(data.x, data.y, data.z);
            ball.userData.physicsBody.velocity.set(data.vx, data.vy, data.vz);
        } catch (error) {
            console.error(error);
        }
    });

    // Écouter les mises à jour du score
    socket.on('score', (score) => {
        updateScore(score);
    });

    socket.on('ballReset', (data) => {
        const ball = getBall();
        try {
            ball.position.set(data.x, data.y, data.z);
            ball.userData.physicsBody.position.set(data.x, data.y, data.z);
            ball.userData.physicsBody.velocity.set(0, 0, 0);
            ball.userData.physicsBody.angularVelocity.set(0, 0, 0); // Réinitialiser l'angularVelocity
        } catch (error) {
            console.error(error);
        }
    });
}