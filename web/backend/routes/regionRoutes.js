var express = require('express');
var router = express.Router();
var regionController = require('../controllers/regionController.js');


router.get('/', regionController.list);
router.post('/', regionController.create);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);

module.exports = router;
