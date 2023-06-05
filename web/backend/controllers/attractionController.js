var AttractionModel = require('../models/attractionModel.js');
var DistrictModel = require('../models/districtModel.js')
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
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
            // Call the initialize function to get the Attraction collection
            const Attraction = await AttractionModel.initialize();

            // Perform the aggregate query on the Attraction collection
            const aggregateResult = await Attraction.aggregate([
                {
                    $lookup: {
                        from: "district",
                        localField: "districtId",
                        foreignField: "_id",
                        as: "district"
                    }
                },
                {
                    $unwind: "$district"
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
    listEvery: async function (req, res) {
        try {
            // Call the initialize function to get the User collection
            console.log("we in")
            const Attraction = await AttractionModel.initialize();
            // Perform the aggregate query on the Attraction collection
            const aggregateResult = await Attraction.aggregate([
              {
                $lookup: {
                    from: "district",
                    localField: "districtId",
                    foreignField: "_id",
                    as: "district"
                }
              },
              {
                $unwind: "$district"
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
    
        try {
            const Attraction = await AttractionModel.initialize();

            const attractionExists = await Attraction.findOne({ name: req.body.name });
            if (attractionExists) {
                console.log("attraction exists")
                return res.status(500).json('attracction already exists');
            }

            const newAttraction = {
                name: req.body.name,
                districtId: req.body.districtId,
                coordinates: req.body.coordinates,
            };
            const result = await Attraction.insertOne(newAttraction);
            console.log('result:', result);
            res.status(201).json(newAttraction)

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
            const coordinates = req.body.coordinates;
            const updatedData = req.body;

            const Attraction = await AttractionModel.initialize();

            // Perform the aggregate query on the Attraction collection
            await Attraction
                .updateOne(
                    { "_id": ObjectId(id) },
                    { $set: { "name": name } },
                    { $set: { "coordinates": coordinates } }
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
