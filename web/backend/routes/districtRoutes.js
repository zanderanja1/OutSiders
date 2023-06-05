var express = require('express');
var router = express.Router();
var districtController = require('../controllers/districtContoller.js');

router.get('/', districtController.listEvery);
router.get('/:name', districtController.list);
router.get('/city/:name', districtController.listNames);
router.post('/', districtController.create);
router.post('/update/:id', districtController.update);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);


module.exports = router;
