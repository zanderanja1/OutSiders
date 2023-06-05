var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema   = mongoose.Schema;
const { MongoClient, ObjectId } = require('mongodb');
const mongoDB = "mongodb+srv://zanderanja:3ytNvsgkmxLu3Lf0@outsidersdb.yko7zhq.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoDB, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
});

var userSchema = new Schema({
	'username' : String,
	'password' : String,
	'email' : String,
	'admin' : Boolean
});

userSchema.pre('save', function(next){
	var user = this;
	bcrypt.hash(user.password, 10, function(err, hash){
		if(err){
			return next(err);
		}
		user.password = hash;
		next();
	});
});

userSchema.statics.authenticate = function(username, password, callback){
	User.findOne({username: username})
	.exec(function(err, user){
		if(err){
			return callback(err);
		} else if(!user) {
			var err = new Error("User not found.");
			err.status = 401;
			return callback(err);
		} 
		bcrypt.compare(password, user.password, function(err, result){
			if(result === true){
				return callback(null, user);
			} else{
				var err = new Error("Incorrect password.");
				err.status = 401;
				return callback(err);
			}
		});
		 
	});
}


//var User = mongoose.model('user', userSchema);
//module.exports = User;
module.exports = {
	userSchema : mongoose.model('user', userSchema),
  initialize: async function () {
    try {
      await client.connect();
      await client.db("zanderanja").command({ ping: 1 });
      console.log("Successfully pinged database. \nNow connected to the database");
      const userDataBase = client.db('users');
      // Update the 'User' model to use the collection from the database
      const User = userDataBase.collection('user');

      // ... the rest of your code

      return User;
    } catch (err) {
      console.log("Error with database connection");
      throw err;
    }
  }
};