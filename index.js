 const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();


const server = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'https://ayomideabikoye.github.io',
    'https://ayomideabikoye.github.io/Acity-Digital-Library-Frontend/' 
];
const authRoutes = require('./Routes/auth');
const bookRoutes = require('./Routes/books');   
const transactionRoutes = require('./Routes/transactions');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions));
server.use(express.json()); 

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