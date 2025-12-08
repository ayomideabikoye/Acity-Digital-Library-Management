const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();


const server = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./Routes/auth');
const bookRoutes = require('./Routes/books');   
const transactionRoutes = require('./Routes/transactions');

const allowedOrigins = [
    'https://ayomideabikoye.github.io', 
    'https://ayomideabikoye.github.io/Acity-Digital-Library-Frontend'
];

server.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Sample route to test if server is running
server.get('/', (req, res) => {
    res.json( 'Digital Library API is running successfully! ');
});

server.use('/api/auth', authRoutes);
server.use('/api/books', bookRoutes);
server.use('/api/transactions', transactionRoutes);    

server.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found: The requested API endpoint does not exist.' });
});

server.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message
    });
});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});