
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose')
  , OAuth= require('oauth').OAuth
  , request = require('superagent')
    crypto = require('crypto');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('fuck bitches get money'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
  app.enable('jsonp callback');
  mongoose.connect('mongodb://localhost:27017/tweec-it');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//Models
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var AdjustmentSchema = new Schema({
  english_name: { type: String, required: true, trim: true }
, chinese_name: { type: String, required: true, trim: true }
, english_description: { type: String, required: true, trim: true }
, price: { type: Number, required: true }
});
var Adjustment = mongoose.model('Adjustment', AdjustmentSchema);

var ImageSchema = new Schema({
  name: { type: String, required: true, trim: true, index: true }
, path: { type: String, trim: true }
, created_at: { type: Date, default: Date.now }
, delivered_at: Date //day the email is sent
, adjustments: [AdjustmentSchema]
});
var Image = mongoose.model('Image', ImageSchema);

var UserSchema = new Schema({
  name: { type: String, trim: true }
, email: { type: String, required: true, lowercase: true, trim: true, index: { unique: true, dropDups: true } }
, created_at: { type:Date, default: Date.now }
, images: [ImageSchema]
, smugmug_access_token: { type: String, trim: true }
})
var User = mongoose.model('User', UserSchema);

//Controllers
app.get('/populate-db', function(req, res){
  var fail_on_error = function(err){if(err) throw err;}

  var david = new User();
  david.name = "David Byrd";
  david.email = "david@byrdhou.se"
  david.images.push({
    name: 'davidProfilePicture.jpg'
  , path: 'http://byrdhou.se/'
  , adjustments: {
      english_name:'Teeth Whitening' 
    , chinese_name:'美白牙齿'
    , english_description:'we\'ll adjust the shade of the teeth in the picture to look naturally white.'
    , price:'1.75'
  }
  });
  david.save(fail_on_error);
  res.json(david);
});
app.get('/', function(req, res){
  res.render('index');
});
app.get('/about', function(req, res){
  res.json({
    team:[{name:'TJ Rak', role:'Business'}, 
            {name:'David Byrd', role:'Tech'}, 
            {name:'Lena Shagieva', role:'Design'}]
  , story: 'We all met while working at Singularity University in 2011. We like making useful stuff for people that doesn\'t already exist, so we made Tweec.it'
  });  
});
app.get('/users', function(req, res){
  User.find({}, function(err, docs){
    if(err) throw err;
    res.json(docs);
  });
});
app.get('/users/:id', function(req, res){
  User.findOne({email: req.params.id}, function(err, doc){
    if(err) throw err;
    res.json(doc);
  });  
});
app.post('/users/create', function(req, res){
  var user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.save(function(err){
    res.json({sucess:!err});
  }); 
});
app.put('/users/:id/update', function(req, res){
  User.update({ email: req.params.id }, req.body, {multi: false}, function(err, docs){
    res.json({sucess:!err});
  }); 
});
app.del('/users/:id/destroy', function(req, res){
  User.findOne({email: req.params.id}, function(err, doc){
    if(err) throw err;
    doc.remove();
    res.json({sucess:!err});
  });  
});
app.get('/users/:id/images', function(req, res){
  User.findOne({email: req.params.id}, function(err, user){
    if(err) throw err;
    res.json(user.images);
  });
});
app.get('/users/:id/images/:img_id', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    res.json(user.images.id(req.params.img_id));
  });
});
app.post('/users/:id/images/create', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    user.images.push(req.body);
    user.save(function(err){
      res.json({success:!err});
    });
  }); 
});
app.put('/users/:id/images/:img_id/update', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    for(attr in req.body) { user.images.id(req.params.img_id)[attr] = req.body[attr]; }
    user.save(function(err){
      if(err) throw err;
      res.json({success:!err});
    });
  }); 
});
app.del('/users/:id/images/:img_id/destroy', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    user.images.id(req.params.img_id).remove();
    user.save(function(err){
      if(err) throw err;
      res.json({success:!err});
    });
  }) 
});
app.get('/users/:id/images/:img_id/adjustments', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    res.json(user.images.id(req.params.img_id).adjustments)
  });
});
app.get('/users/:id/images/:img_id/adjustments/:adjust_id', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    res.json(user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id))
  }); 
});
app.post('/users/:id/images/:img_id/adjustments/create', function(req, res){
  var tweecs = {
    'whiten-teeth': {
        english_name:'Teeth Whitening' 
      , chinese_name:'美白牙齿'
      , english_description:'we\'ll adjust the shade of the teeth in the picture to look naturally white.'
      , price:'2'
    }
  , 'remove-acne': {
        english_name:'Remove Acne' 
      , chinese_name:'去除粉刺'
      , english_description:'we\'ll smooth your skin to look naturally clear of acne.'
      , price:'2'
    }
  }
  var adjustment = tweecs[req.body.slug]
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) err;
    user.images.id(req.params.img_id).adjustments.push(tweecs[req.body.slug]);
    user.save(function(err){
      if(err) throw err;
      res.json({sucess:!err});
    });
  }); 
});
app.put('/users/:id/images/:img_id/adjustments/:adjust_id/update', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id)
    for(attr in req.body) { user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id)[attr] = req.body[attr]; }
    user.save(function(err){
      if(err) throw err;
      res.json({success:!err});
    });
  }); 
});
app.del('/users/:id/images/:img_id/adjustments/:adjust_id/destroy', function(req, res){
  User.findOne({'email': req.params.id}, function(err, user){
    if(err) throw err;
    user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id).remove();
    user.save(function(err){
      if(err) throw err;
      res.json({success:!err});
    });
  });  
});

//helpers

var callback_url = "http://0.0.0.0:3000/smugmug/auth/callback";
var app_url = "http://0.0.0.0:3000/";
//post request token
//persist access token that I get back
//fetch photos and display them on the page with the access token
var request_token_url ="http://api.smugmug.com/services/oauth/getRequestToken.mg";
var authorize_url = "http://api.smugmug.com/services/oauth/authorize.mg";
var access_token_url ="http://api.smugmug.com/services/oauth/getAccessToken.mg";

var access_point = "http://api.smugmug.com/services/api/json/1.3.0/";

var smugmug_secret = "8837237e5a2e0ac93e8d1cbcc08e5a11";
var smugmug_key = "MMY5EfpGEMs9ATYaP2r5KcLt33zrN4X6";
var ts = String(Math.round(new Date().getTime() / 1000));
var nonce = crypto.createHash('md5').update(ts).digest("hex");
var signature_method = 'HMAC-SHA1';
var signature = crypto.createHmac('sha1', smugmug_key).update(smugmug_secret).digest('hex');
// request.get("http://api.smugmug.com/services/oauth/getRequestToken.mg").send({oauth_consumer_key: smugmug_key, oauth_timestamp: ts, oauth_nonce: nonce, oauth_signature_method: signature_method, oauth_signature: signature}).end(function(res){
//           if(res.ok){
//             //do something with res.body
//             console.log(res.body);
//           } else {
//             //parse error in res.text
//             console.log('request failed: ' + res.text);
//           }
//         });


var oa = new OAuth(
  "http://api.smugmug.com/services/oauth/getRequestToken.mg",
  "http://api.smugmug.com/services/oauth/getAccessToken.mg",
  smugmug_key,
  smugmug_secret,
  "1.0",
  callback_url,
  "HMAC-SHA1"
);
app.get('/:user_email/smugmug/auth', function(req, res){
  User.find({email: req.params.user_email}, function(err, docs){
    if(docs.length < 1) {
      req.session.user_email = req.params.user_email;
      var user = new User({email: req.params.user_email});
      user.save(function(err){
        if(err) throw err;
      });
    } else {
      req.session.user_email = docs[0].email;
    }
  });
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if(error){
      console.log(error);
      res.send("yeah no. didn't work");
    } else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      req.session.oauth.token_secret = oauth_token_secret;
      res.redirect('http://api.smugmug.com/services/oauth/authorize.mg?oauth_token='+oauth_token);
    }
  });
});
app.get('/smugmug/auth/callback', function(req, res){
  if(req.session.oauth){
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;

    oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier, function(error, oauth_access_token, oauth_access_token_secret, results){
      if(error){
        console.log(error);
        res.send('yeah something broke');
      } else {
        req.session.oauth.access_token = oauth_access_token;
        req.session.oauth.access_token_secret = oauth_access_token_secret;
        oa.post(
          "http://api.smugmug.com/services/api/json/1.3.0/",
          oauth_access_token, oauth_access_token_secret,
          {'method': 'smugmug.albums.get'},
          function(err, data){
            if(err) throw err;
            data = JSON.parse(data);
            if(data.stat == "ok"){
              var albums = [];
              for(var i = 0; i < data.Albums.length; i++){
                albums.push({
                  id: data.Albums[i].id, 
                  key: data.Albums[i].Key, 
                  title: data.Albums[i].Title
                });
              }
              res.render('images', {albums: albums});
              //render a template with the albums
              //then have the template make a call async for the images in album
            }
            //res.send("worked. nice one. Good to meet you " + req.session.user_email+'\n'+data);
          }
        );     
      }
    });
  }
});
app.get('/smugmug/images/:id/:key', function(req, res){
  oa.post(
    "http://api.smugmug.com/services/api/json/1.3.0/",
    req.session.oauth.access_token, req.session.oauth.access_token_secret,
    {
      'method': 'smugmug.images.get',
      'AlbumID': req.params.id,
      'AlbumKey': req.params.key
    },
    function(err, data) {
      if(err) throw err;
      data = JSON.parse(data);
      //request image urls
      image_urls = [];
      num_images = data.Album.Images.length;
      for(var i = 0; i < num_images; i++) {
        oa.post(
          "http://api.smugmug.com/services/api/json/1.3.0/",
          req.session.oauth.access_token, req.session.oauth.access_token_secret,
          {
            'method': 'smugmug.images.getURLs',
            'ImageID': data.Album.Images[i].id,
            'ImageKey': data.Album.Images[i].Key
          },
          function(err, data){
            if(err) throw err;
            data = JSON.parse(data);
            console.log(data.Image.OriginalURL);
            image_urls.push(data.Image.OriginalURL);
            if(image_urls.length == num_images){
              console.log(image_urls);
              res.json(image_urls);
            }
          }
        );  
      }
    }
  );
});




http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
