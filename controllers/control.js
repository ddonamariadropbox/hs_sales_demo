var Customer = require('../models/content');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const fs = require('fs');
var multer  = require('multer')
const hellosign = require('hellosign-sdk')({ key: config.hellosignKey });
var Color = require('color');
const request = require('request');



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
   var color = Color(req.body.primary_color);

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

        var first_color = "";
        const opts = {
          name: prospect.name,
          domain: 'apidemo.hellosign.com',
          callback_url: 'http://www.google.com'
          //ADD HELLOSIGN LOGO BELOW
        // custom_logo_file: req.file.path
        };
        prospect.template = req.body.template;

        if(!req.file){
          prospect.logo = "public/siteimages/hellosign-white2.png";
          prospect.primary_color = "#00B3E6";

        }else{
                prospect.logo = req.file.path;
                prospect.primary_color = req.body.primary_color;

                  if(color.contrast(Color("#F7F8F9")) > 2.1 && color.contrast(Color("#1A1A1A")) > 2.1){
                    first_color = req.body.primary_color;
                  }else {
                  first_color = "#808080";
                  }


                  var whitelabel = JSON.stringify({primary_button_color:first_color, secondary_button_text_color:first_color});






                opts.white_labeling_options = whitelabel;
                opts.custom_logo_file = fs.createReadStream(req.file.path);
          }




        //  request.post('https://api.hellosign.com/v3/api_app').form(opts)
          ///////
          /////
          ////NEW/////
          request({
           method: 'POST',
           uri: 'https://api.hellosign.com/v3/api_app',
           auth: {
               'user': config.hellosignKey,
               'pass': ''
           },
           formData:opts
       }, function (error, response, body) {
           if(error){
               console.log("ERROR: " + error);
           }else{
             var dat = JSON.parse(body);
             console.log(body);
             console.log("DAT:  " + dat.api_app.client_id);

               prospect.api_app = dat.api_app.client_id;
               prospect.save(function(err){
                         if(err){return next(err);}

                         res.redirect(prospect_name);
                       });

           }
       });


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
        var temp = "";
        console.log(found_prospect.template);


      if(found_prospect.template == "NDA"){
      temp = config.NDA_temp;
          }else if(found_prospect.template == "MSA"){
          temp = config.MSA_temp;
        }else if(found_prospect.template == "EmpAck"){
          temp = config.EMPACK_temp;
      }else if(found_prospect.template == "Waiver"){
          temp = config.WAIVER_temp;
        } else {
          temp = config.NDA_temp;

      }

console.log(temp);
        const opts = {
            test_mode: 1,
            clientId: found_prospect.api_app,
            template_id: temp,
            title: 'embedded draft test',
            subject: 'embedded draft test',
            message: 'embedded draft test',
          //  signing_redirect_url: company.url,
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
                var json_res = JSON.stringify({url: response.embedded.sign_url, clientid: found_prospect.api_app});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(json_res);

              })
              .catch(function(err){
                console.log(err);
                res.end(err);
                                  //catch error
              });


      //  res.render('layouts/signup', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, c_id: found_prospect.client_id, layout: 'layout'});
      } else{
        res.render('/');
        //res.render('layouts/signup', { title: "NOPE" , customer_logo: "didnt work", layout: 'layout'});
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

var company = req.params.company;
var color = Color(req.body.primary_color);
var first_color = "";
//console.log("this is the color" + color);

if(color.contrast(Color("#F7F8F9")) > 2.1 && color.contrast(Color("#1A1A1A")) > 2.1){
  first_color = req.body.primary_color;
  //console.log("COLOR OKAY");
}else {
first_color = "#808080";
  //console.log("COLOR NOT NOT NOT OKAY");
}
var whitelabel = JSON.stringify({primary_button_color: first_color, secondary_button_text_color:first_color});
var opts = {white_labeling_options:whitelabel};


Customer.findOne({name: company})
  .exec( function(err, found_prospect){
    if(err){return next(err);}
    if(found_prospect){
      console.log(found_prospect);

      var new_temp = "";

      if(req.body.template == "dontchange"){
        new_temp = found_prospect.template;
      } else{
        new_temp = req.body.template;
      }


      if(!req.file){
        Customer.updateOne({name:{$eq:req.params.company}},{$set: {primary_color: req.body.primary_color, template: new_temp }}, (err, item) => {



          hellosign.apiApp.update(found_prospect.api_app, opts).then((ress) => {
                    // handle respon
                    res.redirect("/"+req.params.company);

                  }).catch((err) => {
                    // handle error
                    console.log(err);
                  });
            });

      }else{
    //Customer.updateOne({"name": company},{$set: {"primary_color": "#ffffff"}});
    Customer.updateOne({name:{$eq:req.params.company}},{$set: {logo: req.file.path, primary_color: req.body.primary_color, template: new_temp }}, (err, item) => {
     console.log(item)
     // res.redirect("/"+req.params.company);

     opts.custom_logo_file = fs.createReadStream(req.file.path);

     request({
      method: 'POST',
      uri: 'https://api.hellosign.com/v3/api_app/' + found_prospect.api_app,
      auth: {
          'user': config.hellosignKey,
          'pass': ''
      },
      formData:opts
  }, function (error, response, body) {
      if(error){
          console.log("ERROR: " + error);
      }else{
        var dat = JSON.parse(body);
        console.log("DAT:  " + dat.api_app.client_id);
        res.redirect("/"+req.params.company);

      }
  });



     ///////////ORIGINAL//////////
     /////////////////////////////
     // hellosign.apiApp.update(found_prospect.api_app, opts).then((ress) => {
     //           // handle respons
     //
     //
     //           ////UPDATE LOGO image
     //
     //
     //
     //           res.redirect("/"+req.params.company);
     //
     //         }).catch((err) => {
     //           // handle error
     //         });
     ////////////////////////////////
     ////////////////////////////////

    });
    }


    } else{

res.redirect("/");
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

exports.assignorder = function(req,res){
  var company = req.params.company;

  Customer.findOne({name: company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){
        console.log(req.body.numofsign); //
        var signer_num = req.body.numofsign;

        //var template_file = fs.createReadStream(req.file.path).path;
      //  console.log(template_file);
      //  res.render('layouts/signerorder', { signers: signer_num, temp_file: template_file, title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
       res.render('layouts/signerorder', { signers: req.body.numofsign, title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});
      } else{

      //  res.render('createtemplate', {layout: 'layout'});

      }
    });
}

exports.launchtemp = function(req,res){

// console.log("DUH");
//var f = fs.createReadStream(req.file.filename);
//console.log("heyt" + f);

 console.log(req.body);
  console.log(req.file);
//var body = JSON.parse(JSON.stringify(req.body));
//console.log(body);
//var signers = JSON.stringify(req.body.signers);
var template_file = fs.createReadStream(req.file.path).path;

//var signers = JSON.parse(req.body.roles);
// var signers = req.body.roles;
 var company = req.body.company;
console.log("about to find");
Customer.findOne({name: company})
  .exec( function(err, found_prospect){
    if(err){return next(err);}
    if(found_prospect){



      const opts = {
        test_mode: 1,
        clientId: found_prospect.api_app,
        allow_reassign: 1,
        allow_ccs: 1,
        merge_fields: [{"name":"Full Name","type":"text"},{"name":"Company","type":"text"}],

      //  title: req.body.title,
        //subject: req.body.title,
        //message: req.body.message,
        // signer_roles: [
        //   {
        //     name: 'Manager',
        //     order: 0
        //   },
        //   {
        //     name: 'Employee',
        //     order: 1
        //   }
        // ],
      //   signer_roles: signers,
        files: [template_file]
      };

//      var s_signers = JSON.stringify(req.body.signers);
    //  s_signers = JSON.parse(s_signers);


      console.log("Response time");
      console.log(opts);


    const results = hellosign.template.createEmbeddedDraft(opts).then((response) => {
      // handle response
      console.log("were in it");
      fs.unlink(template_file, (err) => {

        console.log(response.template);
        var json_res = JSON.stringify({edit_url: response.template.edit_url, template_id: response.template.template_id, clientid: found_prospect.api_app});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(json_res);
        if (err) throw err;
    });

    }).catch((err) => {
      console.log(err);
      // handle error
    });


console.log(results);
  //    res.render('', { title: company , customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, layout: 'layout'});

    } else{
      console.log("didng find shit");
    //  res.render('createtemplate', {layout: 'layout'});
    var json_res = JSON.stringify({edit_url: "whoa", template_id: "dumbdumb", clientid: "dummy"});
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(json_res);

    }
  });






}

exports.usetemplate = function(req, res){
  //console.log("WE BE CALLIN THE FUNCTION " + req.body.id + " Name: " + req.body.name);
  console.log(req.params);
  Customer.findOne({name: req.params.company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){

  res.render('layouts/usetemplatenow', {templateid: req.params.tempid, title: req.params.company, customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, c_id: found_prospect.client_id, layout: 'layout'});
}else{


}
});
  //res.redirect(200, 'layouts/usetemplatenow');
}

exports.sendtemplaterequest = function(req,res){

    //do what you need here
    console.log("YO HEY");
    Customer.findOne({name: req.params.company})
      .exec( function(err, found_prospect){
        if(err){return next(err);}
        if(found_prospect){



            res.render('layouts/requestfromtemp', { title: req.params.company, customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, c_id: found_prospect.client_id, layout: 'layout'});



  }else{


  }
  });



}


exports.launchrequest = function(req,res){


  Customer.findOne({name: req.body.company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){


        console.log("were doing it111");
        var temp = "";

  

        if(found_prospect.template == "NDA"){
        temp = config.NDA_temp;
            }else if(found_prospect.template == "MSA"){
            temp = config.MSA_temp;
          }else if(found_prospect.template == "EmpAck"){
            temp = config.EMPACK_temp;
        }else if(found_prospect.template == "Waiver"){
            temp = config.WAIVER_temp;
          } else {
            temp = config.NDA_temp;

        }

          const opts = {
            test_mode: 1,
            clientId: found_prospect.api_app,
            template_id: temp,
            signers: [
              {
                email_address: req.body.email,
                name: 'Client',
                role: 'Client'

              }
            ],
            requester_email_address: 'michaelphaley@gmail.com'
          };

          hellosign.unclaimedDraft.createEmbeddedWithTemplate(opts).then((response) => {
            // handle response

            console.log(response);
            var json_res = JSON.stringify({claim_url: response.unclaimed_draft.claim_url, clientid: found_prospect.api_app});
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(json_res);

          }).catch((err) => {
            // handle error

            console.log(err);
          });




        }else{


        }
});



}

exports.requestsent = function(req,res){
  Customer.findOne({name: req.params.company})
    .exec( function(err, found_prospect){
      if(err){return next(err);}
      if(found_prospect){



          res.render('layouts/requestsent', { title: req.params.company, customer_logo: found_prospect.logo, primary_color: found_prospect.primary_color, c_id: found_prospect.client_id, layout: 'layout'});



}else{


}
});
}
