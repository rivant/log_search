const express = require('express');
const router = express.Router();
const glob = require('glob');
const fs = require('fs');

/* GET Source Adapters */
router.get('/', function(req, res, next) {
	let srcList = '';
	
	glob('./store/*.src.+(stage|uat|dev|prod)', (err, files) => {
		files.forEach((file) => {
			srcList += fs.readFileSync(file, 'utf8');
		});

		res.send('{'+ srcList.slice(0, -1) +'}');
	});
});

module.exports = router;