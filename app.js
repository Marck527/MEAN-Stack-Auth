const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

const config = require('./config/db'); // Config file

// Mongoose config
mongoose.connect(config.database);

mongoose.connection.on('connected', () => { // On successfull connection
    console.log('Successfully connected to database');
});

mongoose.connection.on('error', (err) => { // On database error
    console.log('Database error: '+err);
});

const app = express(); // Intitialize express

app.set('port', (process.env.PORT || 5000)); // Set port


// Route variables
const users = require('./routes/users');


// Middleware
app.use(cors()); // Allows outside domains to send requests
app.use(bodyParser.json()); // Body parser to collect form data
app.use(passport.initialize()); // Passport for authentication
app.use(passport.session());

// Password JSON Web Token strategy
require('./config/passport')(passport);


// Static folder
app.use(express.static(path.join(__dirname, 'public')));



// Routes
app.use('/users', users);

app.get('/', (req, res) => {
    res.send('Inavalid Endpoint');
});

app.get('*', (req, res) => { // For every other route not defined, send the index.html
    res.sendFile(path.join(__dirname, 'public/index.html'));
});



app.listen(app.get('port'), () => { // Start server
    console.log("Server started on port ", app.get('port'));
});