var mongoose = require('mongoose');
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

var citySchema = new Schema({
	'name' : String,
	'regionId': ObjectId
});


//var User = mongoose.model('user', userSchema);
//module.exports = User;
module.exports = {
	citySchema : mongoose.model('city', citySchema),
  initialize: async function () {
    try {
      await client.connect();
      await client.db("zanderanja").command({ ping: 1 });
      console.log("Successfully pinged database. \nNow connected to the database");
      const cityDataBase = client.db('map');
      // Update the 'User' model to use the collection from the database
      const City = cityDataBase.collection('city');

      // ... the rest of your code

      return City;
    } catch (err) {
      console.log("Error with database connection");
      throw err;
    }
  }
};