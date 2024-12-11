const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const { v4: uuidv4 } = require('uuid'); 

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(), 
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: '60fb01bc-b7d3-11ef-8c4c-3a7fce8d5812', 
  }
}, {
  timestamps: true, 
});

module.exports = User;
