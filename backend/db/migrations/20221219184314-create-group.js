'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      organizerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING(100)
      },
      about: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.ENUM('Any Category', 'New Groups',
        'Art & Culture', 'Career & Business',
        'Community & Environment', 'Dancing',
        'Games', 'Health & Wellbeing',
        'Hobbies & Passions', 'Identity & Language',
        'Movements & Politics', 'Music',
        'Parents & Famnily', 'Pets & Animals',
        'Religion & Spirituality', 'Science & Education',
        'Social Activities', 'Sports & Fitness',
        'Support & Coaching', 'Technology',
        'Travel & Outdoor')
      },
      private: {
        type: Sequelize.BOOLEAN
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Groups";
    await queryInterface.dropTable(options);
  }
};