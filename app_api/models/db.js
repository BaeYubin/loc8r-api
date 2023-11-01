const mongoose = require('mongoose');
const dbURI = 'mongodb://127.0.0.1:27017/Loc8r';
//const dbURI = 'mongodb://localhost:27017Loc8r';
//const dbURI = 'mongodb+srv://myatlasdbuser:yb12345@cluster0.gzyjs4s.mongodb.net/Loc8r '
const readLine = require('readline');

const connect = () => {
    setTimeout(() => mongoose.connect(dbURI, { useNewUrlParser: true }), 1000);
}  

mongoose.connection.on('connected', ()=> {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', err=> {
    console.log('error: ' + err);
    return connect();
});

mongoose.connection.on('disconnected', () => {
    console.log('disconnected');
});

if (process.platform === 'win32') {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on ('SIGINT', () => {
        process.emit("SIGINT");
    });
}

const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through + ${msg}`);
        callback();
    });
};
//For nodemon restarts
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', ()=> {
        process.kill(process.pid, 'SIGURS2');
    });
});
//For app termination
process.on('SIGINT', function () {
    gracefulShutdown('app termination',()=> {
        process.exit(0);
    });
});
//For Heroku app termination
process.once('SIGTERM', function () {
    gracefulShutdown('Heroku app shutdown', ()=> {
        process.exit(0);
    });
});
connect();
require('./locations');