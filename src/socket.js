import { createPlayerCube } from './player.js';
import { updateScore } from './scene.js';
import { updateBallPosition, getBallData } from './ball.js';

export function initSocket(players, colliders, scene, onBallInit, updatePlayerList) {
    const socket = io();
    const pseudonym = prompt("Entrez votre pseudonyme :");

    // Envoyer l'événement de nouveau joueur au serveur
    socket.emit('newPlayer', { pseudonym });

    // Initialiser tous les joueurs lorsque la connexion est établie
    socket.on('init', (serverPlayers) => {
        Object.keys(serverPlayers).forEach(id => {
            if (!players[id]) {
                players[id] = createPlayerCube(serverPlayers[id], scene, colliders);  // Passer colliders
            }
        });

        // Mettre à jour la liste des joueurs côté client
        updatePlayerList(serverPlayers);
    });

    // Initialisation de la balle
    socket.on('ballInit', (ballData) => {
        onBallInit(ballData);  // Appelle la fonction pour créer la balle
    });

    // Ajout d'un nouveau joueur
    socket.on('newPlayer', (player) => {
        if (!players[player.id]) {
            players[player.id] = createPlayerCube(player, scene, colliders);
            updatePlayerList(players);  // Mettre à jour la liste avec le nouveau joueur
        }
    });

    // Écouter l'événement scored et mettre à jour le score
    socket.on('scored', (score, ballData) => {
        console.log('Scored:', score);
        updateScore(score); // Mettre à jour l'affichage du score
        updateBallPosition(ballData, getBallData()); // Réinitialiser la balle au centre
    });

    return socket;
}

export function handleSocketEvents(socket, players, colliders, scene, onBallMoved, updatePlayerList) {
    // Mettre à jour la position d'un joueur
    socket.on('playerMoved', (player) => {
        if (players[player.id]) {
            players[player.id].position.set(player.x, player.y, player.z);
            colliders[player.id].setFromObject(players[player.id]);  // Mettre à jour le collider du joueur
        }
    });

    // Mettre à jour la position de la balle
    socket.on('ballMoved', (data) => {
        onBallMoved(data);  // Appelle la fonction pour déplacer la balle
    });

    // Gestion de la déconnexion d'un joueur
    socket.on('playerDisconnected', (id) => {
        if (players[id]) {
            scene.remove(players[id]);
            delete players[id];
            delete colliders[id];  // Supprimer aussi le collider
            updatePlayerList(players);  // Mettre à jour la liste des joueurs restants
        }
    });
}
