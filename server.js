const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration de la bdd et de la connexion à celle-ci
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("gameDB");
        console.log("Connecté à MongoDB");
    } catch (err) {
        console.error("Erreur lors de la connexion à MongoDB :", err);
    }
}

connectDB();

app.use(express.static(__dirname + '/src'));

let players = {};

async function createNewGame() {
    try {
        const collection = db.collection('games');
        const newGame = {
            startTime: new Date(),
            players: [],
            score: { left: 0, right: 0 },
        };
        const result = await collection.insertOne(newGame);
        currentGameId = result.insertedId; 
        console.log("Nouvelle partie créée :", currentGameId);
    } catch (err) {
        console.error("Erreur lors de la création d'une nouvelle partie :", err);
    }
}


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
        if (distance < 1) { 
            return true;
        }
    }
    return false;
}

let currentGameId = null; 


io.on('connection', async (socket) => {
    if (!currentGameId) {
        await createNewGame(); 
    }
    socket.on('newPlayer', async (data) => {
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
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        };
        
        players[socket.id] = player;
        console.log('Nouvel utilisateur connecté :', player.id);

        socket.emit('init', players);
        socket.emit('ballInit', ball);
        socket.emit('scoreInit', score);
        socket.broadcast.emit('newPlayer', players[socket.id]);

         
        try {
            const collection = db.collection('games');
            const sanitizedPlayer = {
                id: player.id,
                pseudonym: player.pseudonym,
                color: player.color,
            };

            await collection.updateOne(
                { _id: currentGameId },
                { $push: { players: sanitizedPlayer } }
            );
            console.log("Joueur ajouté à la base de données :", sanitizedPlayer);
        } catch (err) {
            console.error("Erreur lors de l'ajout du joueur dans la base de données :", err);
        }

        socket.on('move', (data) => {
            if (players[socket.id]) {
                players[socket.id].x = data.x;
                players[socket.id].y = data.y;
                players[socket.id].z = data.z;
                players[socket.id].vx = data.vx;
                players[socket.id].vy = data.vy;
                players[socket.id].vz = data.vz;
                data.id = socket.id;
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

        socket.on('goal', async (side) => {
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
        
                try {
                    const collection = db.collection('games');
                    await collection.updateOne(
                        { _id: currentGameId },
                        { $set: { score: { ...score } } }
                    );
                    console.log("Score mis à jour dans la base de données :", score);
                } catch (err) {
                    console.error("Erreur lors de la mise à jour du score :", err);
                }
            }
        });
        

        socket.on('disconnect', () => {
            console.log('Utilisateur déconnecté :', players[socket.id].pseudonym);
            delete players[socket.id];
            io.emit('playerDisconnected', socket.id);
        });

        socket.on('endGame', async () => {
            try {
                const collection = db.collection('games');
                await collection.updateOne(
                { _id: currentGameId },
                { $set: { finished: true, endTime: new Date() } }
            );
            console.log("Partie terminée :", currentGameId);
            currentGameId = null;
            } catch (err) {
                console.error("Erreur lors de la fin de la partie :", err);
             }
        });
    });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});