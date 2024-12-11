const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);

module.exports = app;