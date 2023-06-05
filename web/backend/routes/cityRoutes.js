var express = require('express');
var router = express.Router();
var cityController = require('../controllers/cityController.js');

router.get('/', cityController.listEvery);
router.get('/:name', cityController.list);
router.get('/region/:name', cityController.listNames);
router.post('/update/:id', cityController.update);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);

module.exports = router;
