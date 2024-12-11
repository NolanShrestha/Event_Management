const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const { v4: uuidv4 } = require('uuid'); 
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(), 
    primaryKey: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false,
  tableName: 'roles',
});

module.exports = Role;
