var Customer = require('../models/content');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const fs = require('fs');
var multer  = require('multer')


exports.viewprospect = function(req, res){

//  res.send('HEYEYEYEYE');
  async.parallel({

    customer: function(callback){
      Customer.find({'name': 'Monday Test'})
      .exec(callback);

    },

  }, function(err, results){

    res.render('home', { title: results.customer, layout: 'layout'});

  });

};

exports.createprospect = [

  body('name', 'Customer name required').isLength({ min: 1 }).trim(),

 // Sanitize (escape) the name field.
 sanitizeBody('name').escape(),

 // Process request after validation and sanitization.
 (req, res, next) => {

   const errors = validationResult(req);

   var prospect = new Customer(
      { name: req.body.name }
    );

    Customer.findOne({'name': req.body.name})
      .exec( function(err, found_prospect){

        if(err){return next(err);}
        if(found_prospect){


        res.redirect(prospect.url);
        //res.render('home', {title: prospect.url, prospect_url: prospect.url, layout: false});

        //res.send({status:'ok',link:prospect.url});


      }
      else{


      //  prospect.logo.data = fs.readFileSync(req.file.path, { encoding: 'base64' });
        prospect.logo.data = req.file.path;
        prospect.logo.contentType = 'image/png';


    prospect.save(function(err){
      if(err){return next(err);}



  //  res.redirect(prospect.url);
    //  console.log(req.body);
      res.redirect(req.body.name);



    });
  }
   //res.render('index', { title: req.body.name });
});
}
];

exports.displaylogo = function(req, res){

          var company = req.params.company;



          Customer.findOne({name: company})
            .exec( function(err, found_prospect){
              if(err){return next(err);}
              if(found_prospect){
                //page = found_prospect.logo.contentType;
                console.log(found_prospect);
              //  var displyed_logo = new Buffer(found_prospect.logo.data).toString('base64');
                //res.contentType(found_prospect.logo.contentType);


                res.render('home', { title: company , customer_logo: found_prospect.logo.data, layout: 'layout'});
              } else{




                res.render('home', { title: "NOPE" , customer_logo: "didnt work", layout: 'layout'});


              }

            });

}
