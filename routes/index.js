var express = require('express');
var router = express.Router();
var Customer = require('../models/content');
var prospect_controller = require('../controllers/control');

var multer  = require('multer');
var upload = multer({ dest: 'public/images' });

var app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'HelloSign Demo' });
});

router.post('/submit', upload.single("logo_image"), prospect_controller.createprospect);

router.get('/:company', prospect_controller.displaylogo);

router.get('/:company/signup', prospect_controller.signuppage);

//router.get('/:company/createtemplate', prospect_controller.createtemplate);

router.post('/submitfields', prospect_controller.mergefields);

router.get('/:company/dashboards', prospect_controller.dashboards);

router.get('/:company/updatesite', prospect_controller.updatesite);

router.post('/:company/updatesite', upload.single("logo_image"), prospect_controller.submit_updates);

 router.get('/:company/createtemplate', prospect_controller.assignorder);
//router.post('/upload_temp', upload.single("template_file"), prospect_controller.assignorder);

// router.post('/:company/launchtemplate', prospect_controller.launchtemp);

router.post('/launch_template', upload.single("template_file"), prospect_controller.launchtemp);

//router.get('/:company/:templateid', prospect_controller.sendtemplate);
router.get('/:company/request', prospect_controller.sendtemplaterequest);
router.get('/:company/requestsent', prospect_controller.requestsent);

router.get('/:company/:tempid', prospect_controller.usetemplate);

router.post('/launch_request', prospect_controller.launchrequest);




module.exports = router;
