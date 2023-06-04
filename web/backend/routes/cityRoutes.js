var express = require('express');
var router = express.Router();
var cityController = require('../controllers/cityController.js');


router.get('/:name', cityController.list);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);

module.exports = router;
