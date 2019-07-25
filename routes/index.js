var express = require('express');
var router = express.Router();
var Customer = require('../models/content')
var prospect_controller = require('../controllers/control');

var multer  = require('multer')
var upload = multer({ dest: 'public/images' })

var app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/submit', upload.single("logo_image"), prospect_controller.createprospect);

router.get('/:company', prospect_controller.displaylogo);

router.get('/:company/signup', prospect_controller.signuppage);

router.get('/:company/createtemplate', prospect_controller.createtemplate);

router.post('/submitfields', prospect_controller.mergefields);

router.get('/:company/dashboards', prospect_controller.dashboards);

router.get('/:company/updatesite', prospect_controller.updatesite);

router.post('/:company/updatesite', upload.single("logo_image"), prospect_controller.submit_updates);

module.exports = router;
