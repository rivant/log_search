const express = require('express');
const router = express.Router();
const readline = require('readline');
const fs = require('fs');
const readLocations = readline.createInterface({
    input: fs.createReadStream('./config/search_locations.json'),
    output: process.stdout,
    terminal: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    comm: res.connection.address(),
    sites: readLocations.history,
    dns: res.connection.servername
  });
});

module.exports = router;