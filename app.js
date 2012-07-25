
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose')
  , OAuth= require('oauth').OAuth
  , request = require('superagent')
  , crypto = require('crypto')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , url = require('url');

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
  // var fail_on_error = function(err){if(err) throw err;}

  // var david = new User();
  // david.name = "David Byrd";
  // david.email = "david@byrdhou.se"
  // david.images.push({
  //   name: 'davidProfilePicture.jpg'
  // , path: 'http://byrdhou.se/'
  // , adjustments: {
  //     english_name:'Teeth Whitening' 
  //   , chinese_name:'美白牙齿'
  //   , english_description:'we\'ll adjust the shade of the teeth in the picture to look naturally white.'
  //   , price:'1.75'
  // }
  // });
  // david.save(fail_on_error);

  User.findOne({email: 'david@byrdhou.se'}, function(err, doc){
    if(err) throw err;
    var user = doc;
    for(var i = 0; i < user.images.length; i++){
      generate_instructions(user.images[i], 'david@byrdhou.se');  
    }
  });
  res.json({success:true});
});
app.get('/', function(req, res){
  res.render('login');
});
app.get('/login', function(req, res){
  res.redirect('/');
});
app.get('/about', function(req, res){
  res.json({
    team:[{name:'TJ Rak', role:'Business'}, 
            {name:'David Byrd', role:'Tech'}, 
            {name:'Lena Shagieva', role:'Design'}]
  , story: 'We all met while working at Singularity University in 2011. We like making useful stuff for people that doesn\'t already exist, so we made Tweec.it'
  });  
});

//todo: figure out how to secure this
// app.get('/users', function(req, res){
//   User.find({}, function(err, docs){
//     if(err) throw err;
//     res.json(docs);
//   });
// });

app.get('/users/:id', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({email: req.params.id}, function(err, doc){
      if(err) throw err;
      res.json(doc);
    });  
  } else {
    res.render('login');
  }
});

//todo figure out how to stop people from creating an unlimited amount of users
// app.post('/users/create', function(req, res){
//   var user = new User();
//   user.name = req.body.name;
//   user.email = req.body.email;
//   user.save(function(err){
//     res.json({sucess:!err});
//   }); 
// });
app.put('/users/:id/update', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.update({ email: req.params.id }, req.body, {multi: false}, function(err, docs){
      res.json({sucess:!err});
    }); 
  } else {
    res.render('login');
  }
});
app.del('/users/:id/destroy', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({email: req.params.id}, function(err, doc){
      if(err) throw err;
      doc.remove();
      res.json({sucess:!err});
    });  
  } else {
    res.render('login');
  }
});
app.get('/users/:id/images', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({email: req.params.id}, function(err, user){
      if(err) throw err;
      res.json(user.images);
    });
  } else {
    res.render('login');
  }
});
app.get('/users/:id/images/:img_id', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      res.json(user.images.id(req.params.img_id));
    });
  } else {
    res.render('login');
  }
});
app.post('/users/:id/images/create', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      user.images.push(req.body);
      user.save(function(err){
        res.json({success:!err});
      });
      download_image(req.body, req.params.id);
    }); 
  } else {
    res.render('login');
  }
});
app.put('/users/:id/images/:img_id/update', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      for(attr in req.body) { user.images.id(req.params.img_id)[attr] = req.body[attr]; }
      user.save(function(err){
        if(err) throw err;
        res.json({success:!err});
      });
    }); 
  } else {
    res.render('login');
  }
});
app.del('/users/:id/images/:img_id/destroy', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      user.images.id(req.params.img_id).remove();
      user.save(function(err){
        if(err) throw err;
        res.json({success:!err});
      });
    });
  } else {
    res.render('login');
  } 
});
app.get('/users/:id/images/:img_id/adjustments', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      res.json(user.images.id(req.params.img_id).adjustments)
    });
  } else {
    res.render('login');
  }
});
app.get('/users/:id/images/:img_id/adjustments/:adjust_id', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      res.json(user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id))
    }); 
  } else {
    res.render('login');
  }
});
app.post('/users/:id/images/:img_id/adjustments/create', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
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
  } else {
    res.render('login');
  } 
});
app.put('/users/:id/images/:img_id/adjustments/:adjust_id/update', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id)
      for(attr in req.body) { user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id)[attr] = req.body[attr]; }
      user.save(function(err){
        if(err) throw err;
        res.json({success:!err});
      });
    }); 
  } else {
    res.render('login');
  }
});
app.del('/users/:id/images/:img_id/adjustments/:adjust_id/destroy', function(req, res){
  if(req.session.user_email && req.params.id == req.session.user_email){
    User.findOne({'email': req.params.id}, function(err, user){
      if(err) throw err;
      user.images.id(req.params.img_id).adjustments.id(req.params.adjust_id).remove();
      user.save(function(err){
        if(err) throw err;
        res.json({success:!err});
      });
    });
  } else {
    res.render('login');
  }  
});

var oa = new OAuth(
  "http://api.smugmug.com/services/oauth/getRequestToken.mg",
  "http://api.smugmug.com/services/oauth/getAccessToken.mg",
  "MMY5EfpGEMs9ATYaP2r5KcLt33zrN4X6",//key
  "8837237e5a2e0ac93e8d1cbcc08e5a11",//secret
  "1.0",
  "http://0.0.0.0:3000/smugmug/auth/callback",
  "HMAC-SHA1"
);
app.get('/:user_email/smugmug/auth', function(req, res){
  User.find({email: req.params.user_email}, function(err, docs){
    if(docs.length < 1) {
      req.session.logged_in = true;
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
  } else {
    res.render('login');
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

app.get('/new_images', function(req, res){
  res.render('new_images');
});

app.get('/checkout', function(req, res){
  res.render('checkout');
});

app.get('/select_tweecs', function(req, res){
  res.render('select_tweecs');
});

function download_image(file_url, email) {
  var download_dir = 'public/images/downloads/' + email +'/';
  var mkdir = 'mkdir -p ' + download_dir;
  var child = exec(mkdir, function(error, stdout, sterr){
    if(error) throw error;
    else{download_file_httpget(file_url);}
  });
  var download_file_httpget = function(target_url){
    var options = {
      host: url.parse(target_url).host,
      port: 80,
      path: url.parse(target_url).pathname
    };
    var file_name = url.parse(target_url).pathname.split('/').pop();

    var file = fs.createWriteStream(download_dir + file_name);
    http.get(options, function(res) {
      res.on('data', function(data) {
        file.write(data);
      }).on('end', function() {
        file.end();
        console.log(file_name + ' downloaded to ' + download_dir);
      });
    });
  };
}

function delete_image(file_url, email) {
  var directory = 'public/images/downloads/' + email + '/';
  var rm = 'rm ' + directory + url.parse(file_url).pathname.split('/').pop();
  var child = exec(rm, function(error, stdout, sterr){
    if(error) throw error;
  });
}

function upload_to_s3(file_name, email) {
  var client = require('knox').createClient({ key: "AKIAIFDOREOAE3AQARAA", secret: "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", bucket: 'tweec'});
  var stream = fs.createReadStream('public/images/downloads/'+email+'/'+file_name);
  client.putStream(stream,'/'+email+'/todo/'+file_name, function(err, res){
    if(err) throw err;
    console.log(res);
  });
}

function download_from_s3(file_name, email) {
  var client = require('knox').createClient({ key: "AKIAIFDOREOAE3AQARAA", secret: "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", bucket: 'tweec'});
  client.get('/'+email+'/todo/'+file_name).on('response', function(res){
    console.log(res.statusCode);
    console.log(res.headers);
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      console.log(chunk);
    });
  }).end();
}

function generate_instructions(image, email){
  var content = ''+image.name+'\n\n';
  for(var i = 0; i < image.adjustments.length; i++){
    console.log(image.adjustments[i].english_name);
    var adjustment = image.adjustments[i];
    var chinese_instruction = adjustment.chinese_name;
    var english_instruction = adjustment.english_name;
    content = content.concat(chinese_instruction + ' - ');
    content = content.concat(english_instruction + '\n');
  }
  console.log(content);
  fs.writeFile('public/images/downloads/'+email+'/todo/'+image.name+'-instructions.txt', content, function(err){
    if(err) throw err;
    console.log(image.name + '-instructions.txt saved to disk');
  }); 
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
