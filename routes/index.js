var express = require('express');
var router = express.Router();
var Customer = require('../models/content')
var prospect_controller = require('../controllers/control');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/submit', prospect_controller.createprospect);

router.get('/:company', function(req, res, next) {

            var company = req.params.company;
            var page = req.params.page;


            res.render('home', { title: company , customer_name: page, layout: 'layout'});


});

router.get('/:company/signup', function(req, res, next) {

            var company = req.params.company;
            var page = req.params.page;

            res.render('layouts/signup', { title: req.params.company, layout: 'layout' });

});




module.exports = router;
