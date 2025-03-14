// server.js (WebSocket Server)
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let players = [];
let choices = {};

server.on('connection', (socket) => {
    if (players.length >= 2) {
        socket.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
        socket.close();
        return;
    }

    players.push(socket);
    const playerNumber = players.length;
    socket.send(JSON.stringify({ type: 'playerNumber', player: playerNumber }));

    console.log(`Player ${playerNumber} connected.`);
    
    if (players.length === 2) {
        players.forEach(s => s.send(JSON.stringify({ type: 'status', message: 'Both players connected! Start playing.' })));
    }

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'choice') {
            choices[playerNumber] = data.choice;
            
            if (choices[1] && choices[2]) {
                const result = determineWinner(choices[1], choices[2]);
                players[0].send(JSON.stringify({ type: 'result', result: result[0] }));
                players[1].send(JSON.stringify({ type: 'result', result: result[1] }));
                choices = {}; // Reset choices for next round
            }
        }
    });

    socket.on('close', () => {
        players = players.filter(p => p !== socket);
        console.log(`A player disconnected.`);
    });
});

function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return ["It's a tie!", "It's a tie!"];
    
    const wins = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    if (wins[choice1] === choice2) {
        return ['You win!', 'You lose!'];
    } else {
        return ['You lose!', 'You win!'];
    }
}

console.log('WebSocket server running on ws://localhost:8080');
