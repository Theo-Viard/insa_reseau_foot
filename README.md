# Jeu de Football 3D en Réseau avec Three.js et Socket.io

Ce projet est un jeu de football multijoueur en ligne développé avec Three.js pour les graphismes 3D et Socket.io pour la communication en temps réel entre les joueurs. Le but du jeu est de marquer le plus de buts possible dans le temps imparti, en affrontant une équipe de 2 contre 2.

## Fonctionnalités Actuelles

- **Contrôles :** Utilisation des flèches directionnelles pour déplacer les joueurs.
- **Multijoueur :** Matchs en ligne en 2v2 via Socket.io.
- **But du jeu :** Marquer un maximum de buts avant la fin du temps imparti.

## Installation

### Prérequis
Assurez-vous d'avoir Node.js installé sur votre machine.

### Étapes

1. Initialisez votre projet :
    ```bash
    npm init -y
    ```

2. Installez les dépendances nécessaires :
    ```bash
    npm install express socket.io
    ```

3. Lancez le serveur :
    ```bash
    node server.js
    ```

## Utilisation

- **Déplacements :** Utilisez les flèches directionnelles pour bouger votre joueur.
- **But du jeu :** Essayez de marquer des buts contre l'équipe adverse.
- **Mode de jeu :** Multijoueur en ligne.


## Technologies Utilisées

- **Three.js** : Librairie pour la création de graphismes 3D dans le navigateur.
- **Socket.io** : Outil pour la gestion des communications en temps réel entre le serveur et les clients.
- **Express.js** : Framework Node.js léger pour la gestion du serveur web.
- **Cannon.js** : Moteur physique Javascript 3D pour implémenter de la physique dans le jeu.
