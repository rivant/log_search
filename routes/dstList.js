var express = require('express');
var router = express.Router();
const glob = require('glob');
const fs = require('fs');

/* GET List of Destination Adapters */
router.get('/', function(req, res, next) {
  var dstList = '';
	
	glob('./store/*.dst.*', (err, files) => {
		files.forEach((file) => {
			dstList += fs.readFileSync(file, 'utf8');
		});
		res.send(dstList);
	});
});

module.exports = router;