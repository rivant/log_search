var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

/* GET Source Adapters */
router.get('/', function(req, res, next) {
  var list = '';
  var sources = spawn('shell/region_src_list.sh');

  sources.stdout.on('data', (buf) => {
    list += buf;
  });

  sources.on('close', () => {
    res.send(list);
  });
});

module.exports = router;