const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const employeeRouter = require('./api/employee');
const menuRouter = require('./api/menu');

const app = express();

// Parse incoming request body and populate req.body with it
app.use(bodyParser.json());

// Enable all cors request
app.use(cors());

// Serve static files
app.use(express.static('.'));

// Serve routes starting with /api/employees
app.use('/api/employees', employeeRouter);

// Serve routes starting with /api/menus
app.use('/api/menus', menuRouter);

// Setup the port used to listen requests 
const PORT = process.env.PORT || 4000;

// Start listening requests
app.listen(PORT, () => { 
    console.log(`Server is listening on port ${PORT}`); 
});

module.exports = app
