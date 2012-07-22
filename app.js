
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose');

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
  name: { type: String, required: true, trim: true }
, email: { type: String, required: true, lowercase: true, trim: true, index: { unique: true, dropDups: true } }
, created_at: { type:Date, default: Date.now }
, images: [ImageSchema]
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
  console.log(req.body);
  User.update({ email: req.params.id }, req.body, {multi: false}, function(err, docs){
    res.json({sucess:!err});
  }); 
});
app.del('/users/:id/destroy', function(req, res){
  console.log(req.body);
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


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
