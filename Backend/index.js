const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use('/api/auth', require('./routes/auth'));
const incidentsRouter = require('./routes/incidents');
app.use('/incidents', incidentsRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
