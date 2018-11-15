var express = require('express');
var router = express.Router();
const glob = require('glob');
const fs = require('fs');

/* GET Source Adapters */
router.get('/', function(req, res, next) {
	var srcList = '';
	
	glob('./store/*.src.*', (err, files) => {
		files.forEach((file) => {
			srcList += fs.readFileSync(file, 'utf8');
		});
		res.send(srcList);
	});
});

module.exports = router;