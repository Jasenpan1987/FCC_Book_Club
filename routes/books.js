var express = require('express');
var router = express.Router();

var books = require('google-books-search');
var User = require('../models/index').User;
var Book = require('../models/index').Book;
var Trade = require('../models/index').Trade;

router.get('/', function(req, res) {
    books.search(req.query.keyword, function(error, results) {
        if (!error ) {
            if(results.length==0){
                res.send({});
            }else{
                res.send(results[0]);
            }
        } else {
            res.send({});
        }
    });
});

router.post('/add', ensureAuthenticated, function(req, res){

    var reqBook = req.body;

    User.findOne({_id: req.user.id}, function(err, user){
        if(err) throw err;
        if(user){
            var newBook = new Book();
            newBook.title = reqBook.title;
            newBook.author = reqBook.author;
            newBook.thumbnail = reqBook.thumbnail;
            newBook.owner = req.user._id;

            newBook.save(function(error, bookSaveResult){
                if(error){
                    throw error;
                }else{
                    user.booklist.push(bookSaveResult._id);
                    console.log(user)
                    user.save(function(saveUserErr){
                        if(saveUserErr){
                            throw saveUserErr;
                        }else{
                            res.send('ok');
                        }

                    })
                }
            })
        }
    });
});

router.get('/requesttrade', ensureAuthenticated, function(req, res){

    User.findOne({_id: req.user._id}, function(findUserError, user){
        if(findUserError){
            res.send('Find User Error');
        }else{
            if(user){
                Book.findOne({_id: req.query.bookid}).populate('owner').exec(function(findBookErr, book){
                    if(findBookErr){
                        res.send('Find Book Error');
                    }else{
                        if(!book){
                            res.send('Did not find the book');
                        }else{
                            console.log(book.owner);
                            Book.find({}, function(err1, books){
                                if(err1){
                                    return res.send('Error:', err1)
                                }
                                if(book.owner==user._id){
                                    req.flash('sameUserId', "Can Not Trade With your own book...")
                                    res.redirect(302, '/')
                                }else{
                                    var newTrade = new Trade();
                                    newTrade.from = user._id;
                                    newTrade.to = book.owner;
                                    newTrade.target = req.query.bookid;
                                    newTrade.accept = null;
                                    newTrade.save(function(err2){
                                        if(err2){
                                            res.send('Error2');
                                        }else{
                                            req.flash('tradeSubmit', "Submit a trade request, waiting for owners response")
                                            res.redirect(302, '/')
                                        }
                                    });
                                }
                            })
                        }
                    }
                })
            }else{
                res.send('Did not find any user')
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
