const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const { v4: uuidv4 } = require('uuid'); 
const Event = require('./event');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(), 
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Event', 
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User', 
      key: 'id',
    },
  },
  booking_date: {
    type: DataTypes.DATE,  
    allowNull: false,      
    defaultValue: DataTypes.NOW,  
  },
}, {
  timestamps: true,
});

module.exports = Booking;
