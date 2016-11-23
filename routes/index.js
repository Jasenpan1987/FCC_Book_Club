var express = require('express');
var router = express.Router();

var User = require('../models/index').User;
var Book = require('../models/index').Book;
var Trade = require('../models/index').Trade;

/* GET home page. */
router.get('/', function(req, res) {

  Book.find({}, function(err, books){
    if(err){
      res.send(err)
    }else{
      res.render('index', {
        title: 'Home',
        user: req.user,
        books: books,
        message: req.flash('loginMessage')||req.flash('signupMessage')||req.flash('sameUserId')||req.flash('tradeSubmit')
      });
    }
  })
});

module.exports = router;
