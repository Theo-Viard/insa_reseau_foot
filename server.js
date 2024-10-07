const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/src'));

let players = {};

const ball = {
    x: 0,
    y: 0.5,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    color: '#123456'
};
let lastGoal = Date.now();
const score = { left: 0, right: 0 };

function getRandomPosition() {
    return {
        x: Math.random() * 10 - 5,
        y: 0,
        z: Math.random() * 10 - 5
    };
}

function isPositionOccupied(position, players) {
    for (let id in players) {
        const player = players[id];
        const distance = Math.sqrt(
            Math.pow(player.x - position.x, 2) +
            Math.pow(player.y - position.y, 2) +
            Math.pow(player.z - position.z, 2)
        );
        if (distance < 1) { // Adjust the distance threshold as needed
            return true;
        }
    }
    return false;
}

io.on('connection', (socket) => {
    socket.on('newPlayer', (data) => {
        let position;
        do {
            position = getRandomPosition();
        } while (isPositionOccupied(position, players));

        const player = {
            id: socket.id,
            pseudonym: data.pseudonym,
            x: position.x,
            y: position.y,
            z: position.z,
            vx: 0,
            vy: 0,
            vz: 0,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        };
        players[socket.id] = player;
        console.log('Nouvel utilisateur connecté :', player.id);

        socket.emit('init', players);
        socket.emit('ballInit', ball);
        socket.emit('scoreInit', score);
        socket.broadcast.emit('newPlayer', players[socket.id]);

        socket.on('move', (data) => {
            if (players[socket.id]) {
                players[socket.id].vx = data.vx;
                players[socket.id].vy = data.vy;
                players[socket.id].vz = data.vz;
                data.id = socket.id;
                data.pseudonym = players[socket.id].pseudonym
                socket.broadcast.emit('playerMoved', data);
            }
        });

        socket.on('moveBall', (data) => {
            ball.x = data.x;
            ball.y = data.y;
            ball.z = data.z;
            ball.vx = data.vx;
            ball.vy = data.vy;
            ball.vz = data.vz;
            socket.broadcast.emit('ballMoved', data);
        });

        socket.on('goal', (side) => {
            if (Date.now() - lastGoal > 1000) {
                if (side === 'left') {
                    score.right++;
                } else {
                    score.left++;
                }
                ball.x = 0;
                ball.y = 0.5;
                ball.z = 0;
                ball.vx = 0;
                ball.vy = 0;
                ball.vz = 0;
                lastGoal = Date.now();
                io.emit('score', score);
                io.emit('ballReset', ball);
            }
        });

        socket.on('disconnect', () => {
            console.log('Utilisateur déconnecté :', players[socket.id].pseudonym);
            delete players[socket.id];
            io.emit('playerDisconnected', socket.id);
        });
    });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});