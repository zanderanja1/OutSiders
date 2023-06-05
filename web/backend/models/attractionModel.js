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

var attractionSchema = new Schema({
	'name' : String,
	'districtID': ObjectId,
  'coordinates':{
    '0':String,
    '1':String
  }
});


//var User = mongoose.model('user', userSchema);
//module.exports = User;
module.exports = {
	attractionSchema : mongoose.model('attraction', attractionSchema),
  initialize: async function () {
    try {
      await client.connect();
      await client.db("zanderanja").command({ ping: 1 });
      console.log("Successfully pinged database. \nNow connected to the database");
      const attractionDataBase = client.db('map');
      // Update the 'User' model to use the collection from the database
      const Attraction = attractionDataBase.collection('attraction');

      // ... the rest of your code

      return Attraction;
    } catch (err) {
      console.log("Error with database connection");
      throw err;
    }
  }
};