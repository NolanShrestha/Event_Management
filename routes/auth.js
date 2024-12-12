const express = require('express');
const { register, login, createEvent, getEvents, editEvent, deleteEvent, bookEvent, viewUsers,
    } = require('../controllers/middlewares');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/createEvent', createEvent);
router.post('/getEvents', getEvents);
router.patch('/editEvent', editEvent);
router.delete('/deleteEvent', deleteEvent);
router.post('/bookEvent', bookEvent);
router.get('/viewUsers', viewUsers);

module.exports = router;
