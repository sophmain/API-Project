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
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId'
      })
      // Group.hasMany(models.Venue, {
      //   foreignKey: 'groupId'
      // })
      Group.hasMany(models.GroupImage, {
        foreignKey: 'groupId'
      })
      Group.belongsToMany(models.User, {
        through: models.Membership
      })
      Group.belongsToMany(models.Venue, {
        through: models.Event
      })
      Group.hasMany(models.Event, {
        foreignKey: 'groupId'
      })
      Group.hasMany(models.Membership, {
        foreignKey: 'groupId'
      })
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    about: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM,
      values: ['In person', 'Online']
      /*'New Groups',
      'Art & Culture', 'Career & Business',
      'Community & Environment', 'Dancing',
      'Games', 'Health & Wellbeing',
      'Hobbies & Passions', 'Identity & Language',
      'Movements & Politics', 'Music',
      'Parents & Famnily', 'Pets & Animals',
      'Religion & Spirituality', 'Science & Education',
      'Social Activities', 'Sports & Fitness',
      'Support & Coaching', 'Technology',
      'Travel & Outdoor'*/
    },
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
    scopes: {
      hideUpdatedCreated: {
        attributes: {
          exclude: ['updatedAt', 'createdAt']
        }
      }
    }
  });
  return Group;
};
