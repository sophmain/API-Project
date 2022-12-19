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

    }
  }
  Attendance.init({
    status: {
      type: DataTypes.ENUM,
      values: ['Going', 'Not Going']
    },
    eventId: DataTypes.INTEGER,
    userId: Database.INTEGER
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
