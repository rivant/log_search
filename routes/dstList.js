var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET List of Destination Adapters */
router.get('/', function(req, res, next) {
  fs.readFile('./store/dst_adapter_list.csv', 'utf8', (err, data) => {
    res.send(data);
  });
});

module.exports = router;
