'use strict';
module.exports = (sequelize, DataTypes) => {
  const shops = sequelize.define('shops', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumb_url: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'shops'
  })
  shops.associate = function(models) {
    // associations can be defined here
  }
  return shops
}
