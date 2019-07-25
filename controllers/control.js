var Customer = require('../models/content');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const fs = require('fs');
var multer  = require('multer')
const hellosign = require('hellosign-sdk')({ key: '62d64b18e4825ad17f29ffbfe6b4946748399801dd0cf51ffa2cd2620bdf367d' });


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
   var prospect_name = encodeURI(req.body.name).replace(/%20/g,'-').replace('.','').toLowerCase();
   var prospect = new Customer(
      { name: prospect_name }
    );

    if (!errors.isEmpty()) {
      res.render('index');
      return;
    }
    else {

    Customer.findOne({'name': prospect_name})
      .exec( function(err, found_prospect){

        if(err){return next(err);}
        if(found_prospect){




        res.redirect(prospect.url);
      }
      else{

        ///enter generic logo if not submitted
        if(!req.file){
          prospect.logo = "public/siteimages/hellosign-white2.png";
          prospect.primary_color = "#00B3E6";

        }else{
            prospect.logo = req.file.path;
            prospect.primary_color = req.body.primary_color;
            var whitelabel = JSON.stringify({link_color: prospect.primary_color, primary_button_color:prospect.primary_color,primary_button_color_hover: prospect.primary_color,secondary_button_text_color:prospect.primary_color,secondary_button_text_color_hover:prospect.primary_color});

        }


        const opts = {
          name: prospect.name,
          domain: 'hellosign.com',
          callback_url: 'http://www.google.com',
          white_labeling_options: whitelabel,
          custom_logo_file: req.file.path
        };



          console.log(opts);
          hellosign.apiApp.create(opts, function(err, ress){
              if (err) {
                  //do something with error
                    prospect.api_app = err;
                    console.log("ERROR MANNNNN" + err);

              } else {

                  prospect.api_app = ress.api_app.client_id;





                  prospect.save(function(err){
                    if(err){return next(err);}

                    res.redirect(prospect_name);
                  });

              }
          });






    // prospect.save(function(err){
    //   if(err){return next(err);}
    //
    //   res.redirect(prospect_name);
    // });

  }
});
}
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


                res.render('home', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
              } else{

                res.render('home', { title: "NOPE" , customer_logo: "didnt work", layout: 'layout'});


              }

            });

}

exports.signuppage = function(req, res){
  var company = req.params.company;

  Customer.findOne({name: company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){
        //page = found_prospect.logo.contentType;
        console.log("just loading the page:" + found_prospect);

        res.render('layouts/signup', { title: found_prospect.name , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, c_id: found_prospect.client_id, layout: 'layout'});
      } else{

        res.render('layouts/signup', { title: "NOPE" , customer_logo: "didnt work", layout: 'layout'});

      }

    });

}


///////
//handle merge fields and returns sign URL to open
///////
exports.mergefields = function(req, res){
  //var company = req.body.url.company;
  var company = req.body.company;
  console.log("were cooking with grease now: " + req.body.company);

  Customer.findOne({name: company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){
        //page = found_prospect.logo.contentType;
        console.log(found_prospect);
      //  console.log("were cooking with grease now");

      var c_fields = JSON.stringify([
                    {
                      name: 'First_Name',
                      value: req.body.first_name
                    },
                    {
                      name: 'Email',
                      value: req.body.email
                    },
                    {
                      name: 'Last_Name',
                      value: req.body.last_name
                    },
                    {
                      name: 'Address',
                      value: req.body.address
                    }
                  ]);
        const opts = {
            test_mode: 1,
            clientId: found_prospect.api_app,
        //  clientId: 'f44c47cb276a359ca39cb521b1248522',
            template_id: '7096686fd33f54e6c69d0e445254a1cfaf3e3637',
            title: 'embedded draft test',
            subject: 'embedded draft test',
            message: 'embedded draft test',
            signing_redirect_url: company.url,
            requester_email_address: 'michaelphaley@gmail.com',


            signers: [
              {
                email_address: req.body.email,
                name: req.body.first_name,
                role: 'Client'
              }

            ],

          custom_fields: c_fields
          };

          console.log(opts);
        //  var n_opts = JSON.stringify(opts);
          hellosign.signatureRequest.createEmbeddedWithTemplate(opts)
              .then(function(response){
                var signatureId = response.signature_request.signatures[0].signature_id;

                return hellosign.embedded.getSignUrl(signatureId);
              })
              .then(function(response){
                //  console.log('URL = ' + response.embedded.sign_url);
                //  console.log("{\"url\":\"" + response.embedded.sign_url + "\"}");
                //  var json_res = "{\"url\":\"" + response.embedded.sign_url + "\"}";
                var json_res = JSON.stringify({url: response.embedded.sign_url, clientid: found_prospect.api_app});
                res.end(json_res);
                  // HelloSign.init(found_prospect.api_app);
                  // HelloSign.open({"url": response.embedded.sign_url, "skipDomainVerification": true});
                //  actuallyopen(found_prospect.api_app, response.embedded.sign_url);
              })
              .catch(function(err){
                console.log(err);
                  //catch error
              });


      //  res.render('layouts/signup', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, c_id: found_prospect.client_id, layout: 'layout'});
      } else{
        //res.render('layouts/signup', { title: "NOPE" , customer_logo: "didnt work", layout: 'layout'});
      }
    });


}




exports.createtemplate = function(req, res){
  var company = req.params.company;

  Customer.findOne({name: company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){
        console.log(found_prospect);


        res.render('layouts/createtemplate', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
      } else{

        res.render('createtemplate', {layout: 'layout'});

      }
    });
}


exports.updatesite = function(req, res){
  var company = req.params.company;

  Customer.findOne({name: company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){
        console.log(found_prospect);


        res.render('layouts/updatesite', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
      } else{

        res.render('/', {layout: 'layout'});

      }
    });



}



exports.submit_updates = function(req, res){
//  var company = JSON.stringify({$name:{$eq:req.params.company}});
//  console.log(company);
//  var update = JSON.stringify({logo: req.file.path, primary_color: req.params.primary_color })
//console.log(update);
// Customer.findOne({name: company})
//   .exec( function(err, found_prospect){
//     if(err){return next(err);}
//     if(found_prospect){
//       console.log(found_prospect);
//       Customer.updateOne({_id:found_prospect._id},{$set: {"primary_color": "#ffffff"}});
//
//       res.render('home', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
//     } else{
//
//       res.render('/', {layout: 'layout'});
//
//     }
//   });

var company = req.params.company;
var whitelabel = JSON.stringify({link_color: req.body.primary_color, primary_button_color:req.body.primary_color,primary_button_color_hover:req.body.primary_color,secondary_button_text_color:req.body.primary_color,secondary_button_text_color_hover:req.body.primary_color});
var opts = {white_labeling_options:whitelabel};

Customer.findOne({name: company})
  .exec( function(err, found_prospect){
    if(err){return next(err);}
    if(found_prospect){
      console.log(found_prospect);

      hellosign.apiApp.update(found_prospect.api_app, opts).then((res) => {
                // handle respons

              }).catch((err) => {
                // handle error
              });

      if(!req.file){
        Customer.updateOne({name:{$eq:req.params.company}},{$set: {primary_color: req.body.primary_color }}, (err, item) => {



            res.redirect("/"+req.params.company);
            });

      }else{
    //Customer.updateOne({"name": company},{$set: {"primary_color": "#ffffff"}});
    Customer.updateOne({name:{$eq:req.params.company}},{$set: {logo: req.file.path, primary_color: req.body.primary_color }}, (err, item) => {
     console.log(item)
     res.redirect("/"+req.params.company);
    });
    }


    } else{


    }
  });


  //res.render('home', { title: company , customer_logo: req.body.primary_color, primary_color: req.body.primary_color, layout: 'layout'});



//  res.redirect("/"+req.params.company);
}





exports.dashboards = function(req, res){


  var company = req.params.company;

  Customer.findOne({name: company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){
        console.log(found_prospect);


        res.render('layouts/dashboards', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
      } else{

      //  res.render('createtemplate', {layout: 'layout'});

      }
    });



}
