 const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();


const server = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./Routes/auth');
const bookRoutes = require('./Routes/books');   
const transactionRoutes = require('./Routes/transactions');

const frontendURL = 'https://yourusername.github.io/your-repo-name'; 

app.use(cors({
    origin: frontendURL,
}));
server.use(cors(corsOptions));
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