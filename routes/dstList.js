const express = require('express');
const router = express.Router();
const glob = require('glob');
const fs = require('fs');

/* GET List of Destination Adapters */
router.get('/', function(req, res, next) {
  let dstList = '';
	
	glob('./store/*.dst.+(stage|uat|dev|prod)', (err, files) => {
		files.forEach((file) => {
			dstList += fs.readFileSync(file, 'utf8');
		});
		res.send(dstList);
	});
});

module.exports = router;