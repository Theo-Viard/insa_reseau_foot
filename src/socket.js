import { createPlayerCube } from './player.js';
import { updateScore } from './scene.js';
import { updateBallPosition, resetBall } from './ball.js';

export function initSocket(players, colliders, scene, world, onBallInit, updatePlayerList) {
    const socket = io();
    const pseudonym = prompt("Entrez votre pseudonyme :");

    // Envoyer l'événement de nouveau joueur au serveur
    socket.emit('newPlayer', { pseudonym });

    // Initialiser tous les joueurs lorsque la connexion est établie
    socket.on('init', (serverPlayers) => {
        Object.keys(serverPlayers).forEach(id => {
            if (!players[id]) {
                players[id] = createPlayerCube(serverPlayers[id], scene, world);  
            }
        });


        updatePlayerList(serverPlayers);
    });

    // Initialisation de la balle
    socket.on('ballInit', (ballData) => {
        onBallInit(ballData);  
    });

    // Initialisation du score
    socket.on('scoreInit', (score) => {
        updateScore(score);  
    });

    // Ajout d'un nouveau joueur
    socket.on('newPlayer', (player) => {
        if (!players[player.id]) {
            players[player.id] = createPlayerCube(player, scene, world);  
            updatePlayerList(players);  
        }
    });

    return socket;
}

export function handleSocketEvents(socket, players, colliders, scene, onBallMoved, updatePlayerList, getBall) {
    // Mettre à jour la position d'un joueur
    socket.on('playerMoved', (player) => {
        if (players[player.id]) {
            players[player.id].position.set(player.x, player.y, player.z);
            colliders[player.id].setFromObject(players[player.id]);  
        }
    });

    // Mettre à jour la position de la balle
    socket.on('ballMoved', (data) => {
        onBallMoved(data);  
    });

    // Gestion de la déconnexion d'un joueur
    socket.on('playerDisconnected', (id) => {
        if (players[id]) {
            scene.remove(players[id]);
            delete players[id];
            delete colliders[id];  
            updatePlayerList(players);  
        }
    });

    socket.on('scored', (score) => {
        console.log('Scored:', score);
        updateScore(score); 
        onBallMoved({ x: 0, y: 0.5, z: 0 });  
    });
}