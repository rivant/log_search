var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

/* GET search results */
router.get('/', function(req, res, next) {
  var chunk = '',
      msgResults = spawn('shell/matches.sh');

  msgResults.stdout.on('data', (buf) => {
    status += buf;
  });

  msgResults.on('close', () => {
    res.send({ msg: chunk });
  });

});

module.exports = router;
