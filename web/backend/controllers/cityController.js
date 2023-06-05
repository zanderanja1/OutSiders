var CityModel = require('../models/cityModel.js');
var bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */

module.exports = {

    /**
     * userController.list()
     */
    list: async function (req, res) {
        try {
            // Call the initialize function to get the User collection

            const city = await CityModel.initialize();
            const name = req.params.name;
            // Perform the aggregate query on the Attraction collection
            const aggregateResult = await city.aggregate([
              {
                $lookup: {
                  from: "region",
                  localField: "regionId",
                  foreignField: "_id",
                  as: "region"
                }
              },
              {
                $unwind: "$region"
              },
              {
                $match: {
                  "name": name
                }
              }
            ]);
            
            const results = await aggregateResult.toArray();
          
            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error when getting regions.',
                error: error
            });
        }
    },
    listEvery: async function (req, res) {
        try {
            // Call the initialize function to get the User collection
            console.log("we in")
            const city = await CityModel.initialize();
            // Perform the aggregate query on the Attraction collection
            const aggregateResult = await city.aggregate([
              {
                $lookup: {
                  from: "region",
                  localField: "regionId",
                  foreignField: "_id",
                  as: "region"
                }
              },
              {
                $unwind: "$region"
              }
              
            ]);
            
            
            const results = await aggregateResult.toArray();
            console.log(results)
            res.status(200).json(results);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error when getting cities.',
                error: error
            });
        }
    },
    listNames: async function (req, res) {
        try {
            // Call the initialize function to get the Attraction collection
            const City = await CityModel.initialize();

            // Perform the aggregate query on the Attraction collection
            const regionName = req.params.name;
            const aggregateResult = await City.aggregate([
                {
                  $lookup: {
                    from: "region",
                    localField: "regionId",
                    foreignField: "_id",
                    as: "region"
                  }
                },
                {
                  $unwind: "$region"
                },
                {
                  $match: {
                    "region.name": regionName
                  }
                }
              ]);
              
            // Convert the aggregate result to an array of documents
            const results = await aggregateResult.toArray();

            res.json(results);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error when getting attractions.',
                error: error
            });
        }
    },
    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },
    /**
     * userController.create()
     */
    create: async function (req, res) {
        var password;
        bcrypt.hash(req.body.username, 10, function (err, hash) {
            if (err) {
                return res.status(500).json('error');
            }
            password = hash;
        });
        try {
            const User = await UserModel.initialize();

            const usernameExists = await User.findOne({ username: req.body.username });
            if (usernameExists) {
                console.log("username exists")
                return res.status(500).json('Username already exists');
            }

            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                console.log("email exists")
                return res.status(500).json('Email already exists');
            }
            const newUser = {
                name: req.body.username,
                password: password,
                email: req.body.email,
                admin: false,
            };
            const result = await User.insertOne(newUser);
            console.log('result:', result);
            res.status(201).json(newUser)

        } catch (err) {
            console.log('Error inserting data:', err);
            return res.status(500).json('Error inserting data');
        }
    },


    /**
     * userController.update()
     */
    update: async function (req, res) {
        try {
            var id = req.params.id;
            const name = req.body.name;
            const updatedData = req.body;

            const City = await CityModel.initialize();

            // Perform the aggregate query on the Attraction collection
            await City
                .updateOne(
                    { "_id": ObjectId(id) },
                    { $set: { "name": name } }
                )
            console.log("ok")
            res.sendStatus(200);

        } catch (error) {
            console.error('Error updating attraction:', error);
            res.sendStatus(500);
        }

    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function (req, res) {
        res.render('user/register');
    },

    showLogin: function (req, res) {
        res.render('user/login');
    },

    login: async function (req, res, next) {
        try {
            const User = await UserModel.initialize();

            const user = await User.findOne({ name: req.body.username });
            if (!user) {
                console.log("username not found");
                const err = new Error('User not found.');
                return res.status(401).json({ "error": err });
            }
            console.log("user found");

            const result = await bcrypt.compare(req.body.password, user.password);
            if (result === true) {
                req.session.userId = user._id;
                console.log("logged in");
                return res.json(user);
            } else {
                const err = new Error('Wrong username or password');
                return res.status(401).json({ "error": err });
            }
        } catch (err) {
            return res.status(500).json({ "error": err });
        }
    },

    profile: async function (req, res, next) {
        try {
            const user = await UserModel.findById(req.session.userId).exec();
            if (user === null) {
                var err = new Error('Not authorized, go back!');
                err.status = 400;
                return next(err);
            } else {
                //return res.render('user/profile', user);
                return res.json(user);
            }
        } catch (err) {
            return next(err);
        }
    },

    logout: function (req, res, next) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    //return res.redirect('/');
                    return res.status(201).json({});
                }
            });
        }
    }
};
