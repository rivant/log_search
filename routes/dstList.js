var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

/* GET List of Destination Adapters */
router.get('/', function(req, res, next) {
  var list = '';
  var destinations = spawn('shell/region_dst_list.sh');

  destinations.stdout.on('data', (buf) => {
    list += buf;
  });

  destinations.on('close', () => {
    res.send(list);
  });

});

module.exports = router;