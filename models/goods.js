'use strict';
module.exports = (sequelize, DataTypes) => {
  const goods = sequelize.define('goods', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    shop_id: {
      type: DataTypes.INTEGER,
      allowNull: false, //! 需要根据商品 id 查询相应的结果所以必须存在
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumb_url: DataTypes.STRING
  }, {
    tableName: 'goods'
  })
  goods.associate = function(models) {
    // associations can be defined here
  }
  return goods
}
