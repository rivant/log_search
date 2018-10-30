var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET Source Adapters */
router.get('/', function(req, res, next) {
  fs.readFile('./store/src_adapter_list.csv', 'utf8', (err, data) => {
    res.send(data);
  });
});

module.exports = router;
