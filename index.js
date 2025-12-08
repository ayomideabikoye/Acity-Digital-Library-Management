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

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from the defined origins or requests with no origin (like internal servers)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
}));

// Sample route to test if server is running
server.get('/', (req, res) => {
    res.json( 'Digital Library API is running successfully! ');
});

server.use('/api/auth', authRoutes);
server.use('/api/books', bookRoutes);
server.use('/api/transactions', transactionRoutes);    

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});