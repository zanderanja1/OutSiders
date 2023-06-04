var express = require('express');
var router = express.Router();
var districtController = require('../controllers/districtContoller.js');


router.get('/:name', districtController.list);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);


module.exports = router;
