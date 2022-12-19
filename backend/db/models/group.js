'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    about: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM,
      values: ['Any Category', 'New Groups',
      'Art & Culture', 'Career & Business',
      'Community & Environment', 'Dancing',
      'Games', 'Health & Wellbeing',
      'Hobbies & Passions', 'Identity & Language',
      'Movements & Politics', 'Music',
      'Parents & Famnily', 'Pets & Animals',
      'Religion & Spirituality', 'Science & Education',
      'Social Activities', 'Sports & Fitness',
      'Support & Coaching', 'Technology',
      'Travel & Outdoor']
    },
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
