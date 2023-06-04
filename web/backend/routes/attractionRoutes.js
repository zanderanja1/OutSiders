var express = require('express');
var router = express.Router();
var attractionController = require('../controllers/attractionController.js');


router.get('/', attractionController.list);
router.post('/update/:id', attractionController.update);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);


module.exports = router;
