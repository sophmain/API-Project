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
        foreignKey: 'organizerId',
        as: 'Organizer'
      })
      Group.hasMany(models.Venue, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.hasMany(models.GroupImage, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.hasMany(models.Membership, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.belongsToMany(models.User, {
        through: models.Membership
      })
      Group.hasMany(models.Event, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        len: [0,60]
      },
      allowNull: false
    },
    about: {
      type: DataTypes.TEXT,
      validate: {
        len: [50, 1000]
      },
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['Online', 'In person']
      /*'New Groups',
      'Art & Culture', 'Career & Business',
      'Community & Environment', 'Dancing',
      'Games', 'Health & Wellbeing',
      'Hobbies & Passions', 'Identity & Language',
      'Movements & Politics', 'Music',
      'Parents & Family', 'Pets & Animals',
      'Religion & Spirituality', 'Science & Education',
      'Social Activities', 'Sports & Fitness',
      'Support & Coaching', 'Technology',
      'Travel & Outdoor'*/
    },
    private: DataTypes.BOOLEAN,
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Group',
    defaultScope: {
      attributes: {
        exclude: ['updatedAt', 'createdAt']
      }
    },
    scopes: {
      hideDetails: {
        attributes: {
          exclude: ['organizerId', 'about', 'type', 'private']
        }
      }
    }
  });
  return Group;
};
