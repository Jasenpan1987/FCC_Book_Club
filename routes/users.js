var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/index').User;
var Book = require('../models/index').Book;
var Trade = require('../models/index').Trade;

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/signup', function(req, res){
  res.render('signup.ejs', {
      message: req.flash('signupMessage'),
      title: 'register'
  });
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/users/signup',
    failureFlash: true
}));

router.get('/login', function(req, res){
    res.render('login.ejs', {
        message: req.flash('signinMessage'),
        title: 'login'
    });
});

router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}));

router.get('/profile', ensureAuthenticated, function(req, res){
    User.findOne({_id: req.user._id}).populate('booklist').exec(function(err, user){
        if(err){
            res.send('User not found');
        }else{
            if(user){
                Trade.find({to: user._id}).populate('target').exec(function(err, toRequest){ //from someone to me
                    if(err){
                        toRequest = [];
                    }else{
                        Trade.find({from: user._id}).populate('target')
                            .exec(function(err2, fromRequest){// I sent to someone else
                                if(err){
                                    fromRequest = [];
                                }else{
                                    console.log('someoneToMe', toRequest);
                                    console.log('meToSomeone', fromRequest);

                                    res.render('profile', {
                                        title: 'user profile',
                                        user: user,
                                        someoneToMe: toRequest,
                                        meToSomeone: fromRequest
                                    })
                                }
                            })
                    }
                });
            }else{
                res.send('User not found')
            }
        }
    });
});

router.get('/acceptrequest', ensureAuthenticated, function(req, res){
    console.log(req.query.requestid+' acceptrequest');
    Trade.update({_id: req.query.requestid}, {$set: {accept: true}}, function(err){
        res.redirect(302, '/users/profile');
    });
});

router.get('/declinerequest', ensureAuthenticated, function(req, res){
    console.log(req.query.requestid+' declinerequest');
    Trade.remove({_id: req.query.requestid}, function(err){
        res.redirect(302, '/users/profile');
    })
});

router.get('/okacceptrequest', ensureAuthenticated, function(req, res){
    console.log(req.query.requestid+' okacceptrequest');
    Trade.findOne({_id: req.query.requestid}).populate('target').exec(function(error, trade){
        if(error){
            res.send('Error');
        }else{
            if(trade){
                Book.findOne({_id: trade.target._id}, function(err2, book){
                    var ownerId = book.owner;
                    var bookId = book._id;
                    Book.remove({_id: bookId}, function(err3){
                        if(err3){
                            res.send('err3');
                        }else{
                            User.findOne({_id: ownerId}, function(err4, owner){
                                if(err4){
                                    res.send('err4')
                                }else{

                                    var newList = owner.booklist.filter(function(book){
                                        return book != bookId;
                                    });
                                    owner.booklist = newList;
                                    owner.save(function(err5){
                                        if(err5){
                                            res.send('err5');
                                        }else{
                                            Trade.remove({_id: req.query.requestid}, function(err6){
                                                if(err6){
                                                    res.send('err6');
                                                }else{
                                                    res.redirect(302, '/users/profile');
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
            }else{
                res.send('Book not found')
            }
        }
    })
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }else{
        res.redirect('/users/login');
    }
}

module.exports = router;
