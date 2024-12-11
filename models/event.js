const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection'); 
const { v4: uuidv4 } = require('uuid'); 

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(), 
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

module.exports = Event;
