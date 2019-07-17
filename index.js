const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '/build')));
const port = process.env.PORT || 1337;

app.listen(port);
