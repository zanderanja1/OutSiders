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

var regionSchema = new Schema({
	'name' : String,
	'geometry' : {
		'type': String,
		'coordinates': {
			type: [[[String]]]
		  }
	}
});


//var User = mongoose.model('user', userSchema);
//module.exports = User;
module.exports = {
	regionSchema : mongoose.model('region', regionSchema),
  initialize: async function () {
    try {
      await client.connect();
      await client.db("zanderanja").command({ ping: 1 });
      console.log("Successfully pinged database. \nNow connected to the database");
      const regionDataBase = client.db('map');
      // Update the 'User' model to use the collection from the database
      const Region = regionDataBase.collection('region');

      // ... the rest of your code

      return Region;
    } catch (err) {
      console.log("Error with database connection");
      throw err;
    }
  }
};