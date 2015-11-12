var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Favorite = require('../models/favorite');
var request = require('request');
var router = express.Router();
var mongoose = require('mongoose');

function filterThumbnail(input){
	if (input && input != 'default' && input != 'self' && input != 'nsfw'){
		return input;			
	}
			
	return '../images/alien-head.png';
}

router.get('/', function(req, res) {
  isAuthenticated = req.isAuthenticated();

  if (isAuthenticated && req.body.user && req.body.user.id){
    res.redirect('/hot');
  }
  else{
    res.redirect('/login');
  }
});

router.post('/register', function(req, res) {
	req.session.newAccountAttempt = true;

  if (req.body.username.length < 6 || req.body.username.length > 14){
    req.session.messages = "Username must be between 6 and 14 chars long.";
    return res.redirect('/login');
  }

	if (req.body.password !== req.body.confirmPassword){
		req.session.messages = "Passwords do not match."
		return res.redirect('/login');
	}

  if (req.body.password.length < 6 || req.body.password.length > 14){
    req.session.messages = "Password must be between 6 and 14 chars long";
    return res.redirect('/login');
  }

  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      req.session.messages = err.message;
      return res.redirect('/login');
    }

    passport.authenticate('local')(req, res, function () {
    	req.session.newAccountAttempt = false;
        res.redirect('/hot');
    });
  });
});

router.get('/login', function(req, res){
	loginActive = "active";
	registerActive = "";

	if(req.session.newAccountAttempt){
		loginActive = "";
		registerActive = "active";
	}

	res.render('login', { classname: "login-body", message: req.session.messages, loginActive: loginActive, registerActive: registerActive });
	req.session.messages = null;
	req.session.newAccountAttempt = false;
});

router.post('/login', function(req,res,next){
  passport.authenticate('local', function(err,user,info){
    req.session.newAccountAttempt = false;

    if(err){
      req.session.messages = "Error with login";
      return next(err);
    }

    if(!user){
      req.session.messages = info.message;
      return res.redirect('/login');
    }

    req.logIn(user, function(err){
      if (err){
        req.session.messages = "Error logging in";
        return next(err);
      }

      req.user = user;
      return res.redirect('/hot');

    });
  })(req,res,next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/hot/', function(req, res) {
  if(!req.user.id){
    return res.send(500);
  }

  var favoriteIDs = [];

  mongoose.model('Favorite').find({userID : req.user.id}, function(err, favorites){
    for(var i = 0; i<favorites.length; i++){
      favoriteIDs.push(favorites[i].redditID);
    }
  });

  request('http://www.reddit.com/hot.json', function (error, response, body){
  	var json = JSON.parse(response.body);

  	for (var i = 0; i < json.data.children.length; i++){
  		json.data.children[i].data.thumbnail = filterThumbnail(json.data.children[i].data.thumbnail);

      if(favoriteIDs.indexOf(json.data.children[i].data.id) > -1){
        json.data.children[i].data.toggle = true;
      }else{
        json.data.children[i].data.toggle = false;
      }
  	}

  	res.render('reddit-list', { classname: "hot-body", posts: json.data.children, user: req.user.username });
  })
  
});

router.get('/top/', function(req, res) {
  if(!req.user.id){
    return res.send(500);
  }

  var favoriteIDs = [];

  mongoose.model('Favorite').find({userID : req.user.id}, function(err, favorites){
    for(var i = 0; i<favorites.length; i++){
      favoriteIDs.push(favorites[i].redditID);
    }
  });

  request('http://www.reddit.com/top.json', function (error, response, body){
  	var json = JSON.parse(response.body);

	  for (var i = 0; i < json.data.children.length; i++){
  		json.data.children[i].data.thumbnail = filterThumbnail(json.data.children[i].data.thumbnail);
  
      if(favoriteIDs.indexOf(json.data.children[i].data.id) > -1){
        json.data.children[i].data.toggle = true;
      }else{
        json.data.children[i].data.toggle = false;
      }
  	}
  
  	res.render('reddit-list', { classname: "top-body", posts: json.data.children, user: req.user.username });
  })
  
});

router.get('/favorites', function(req, res){
  mongoose.model('Favorite').find({userID : req.user.id}, function(err, favorites){
    res.render('favorite-list', { classname: "favorite-body", favorites: favorites, user: req.user.username})
  });
});

router.post('/addFavorite', function(req, res){
  Favorite.create({
    userID: req.user.id, 
    redditID: req.body.redditID, 
    title: req.body.title, 
    url: req.body.url, 
    thumbnail: req.body.thumbnail }, function(err){
      //if(err) do something
    });
  return res.send(200);
});

router.post('/deleteFavorite', function(req, res){
  console.log(req.body.redditID);
  Favorite.remove({redditID: req.body.redditID, userID: req.user.id},function(err){
    //if(err)handle;
  });
  return res.send(200);
});

module.exports = router;
