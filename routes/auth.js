const express = require('express');
const { register, login, createEvent, getEvents, editEvent, deleteEvent, bookEvent, viewUsers, changeUserRole,
    } = require('../controllers/middlewares');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/createEvent', createEvent);
router.get('/getEvents', getEvents);
router.patch('/editEvent', editEvent);
router.delete('/deleteEvent', deleteEvent);
router.post('/bookEvent', bookEvent);
router.get('/viewUsers', viewUsers);
router.patch('/changeUserRole', changeUserRole);

module.exports = router;
