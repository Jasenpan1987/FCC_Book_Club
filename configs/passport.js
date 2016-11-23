var localStrategy = require('passport-local').Strategy;

var User = require('../models/index').User;

module.exports = function(passport){
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('signup', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done){
        console.log(req.body);
        User.findOne({'email': email}, function(err, user){
            if(err){
                console.log(err)
                return done(err);
            }
            if(user){
                console.log('user already exist!!!')
                return done(null, false, req.flash('signupMessage', 'email has already been taken'));
            }else{
                var newUser = new User();
                newUser.email = email;
                newUser.country = req.body.country;
                newUser.city = req.body.city;
                newUser.password = newUser.generateHash(password);

                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return done(err);
                    }else{
                        console.log('signup success')
                        return done(null, newUser, req.flash('signupMessage', 'signup successful'));
                    }
                })
            }
        })
    }));

    passport.use('login', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done){
        User.findOne({'email': email}, function(err, user){
            if(err) return done(err);
            if(!user){
                return done(null, false, req.flash('loginMessage', 'Username wrong'));
            }else{
                if(user.comparePassword(password)){
                    return done(null, user);
                }else{
                    return done(null, false, req.flash('loginMessage', 'Password wrong'));
                }
            }
        })
    }))
};