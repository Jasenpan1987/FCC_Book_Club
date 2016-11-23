var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

/* user schema */
var userSchema = Schema({
    email: String,
    password: String,

    country: String,
    city: String,

    booklist: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    ]

});

userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, 5);
};

userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model('User', userSchema);

/* book schema */
var bookSchema = Schema({
    title: String,
    author: String,
    thumbnail: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

var Book = mongoose.model('Book', bookSchema);

/* trade schema */
var tradeSchema = Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    target: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
    },
    accept: Boolean
});

var Trade = mongoose.model('Trade', tradeSchema);

var models = {
    User: User,
    Book: Book,
    Trade: Trade
};

module.exports = models;