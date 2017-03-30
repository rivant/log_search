var express = require('express'),
    router = express.Router(),
    params = {
       title: 'UAT Server'
    };

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('index', params);
});

module.exports = router;


