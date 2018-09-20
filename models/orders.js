'use strict'
module.exports = (sequelize, DataTypes) => {
    const orders = sequelize.define('orders',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            payment_status: {
                type: DataTypes.ENUM('0', '1'), // Enum 枚举 0 未支付 1 已支付
                defaultValue: '0'
            }
        }, {
            tableName: 'orders'
        })
    return orders
}
