'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendance.belongsTo(models.Event, {
        foreignKey: 'eventId'
      })
      Attendance.belongsTo(models.User, {
        foreignKey: 'userId'
      })

    }
  }
  Attendance.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM,
      values: ['attending', 'not-attending', 'pending']
    },
    eventId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
