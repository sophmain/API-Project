'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')

let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     options.tableName = 'Events'
     return queryInterface.bulkInsert(options, [
      {
        venueId: 1,
        groupId: 1,
        name: 'Hiking',
        description: 'Hike the mountains of Chicago. Dress warm and be prepared for this overnight trip.',
        type: 'In Person',
        capacity: 50,
        price: 100.00,
        startDate: new Date('2023-04-05 8:00:00'),
        endDate: new Date('2023-04-06 10:00:00')
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Dancing',
        description: 'Group dance class beginner level.',
        type: 'In Person',
        capacity: 15,
        price: 40.00,
        startDate: new Date('2023-07-01 13:00:00'),
        endDate: new Date('2023-07-01 14:00:00')
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Making Spaghetti 101',
        description: "If you don't know how to make spaghetti already you should probably come.",
        type: 'In Person',
        capacity: 8,
        price: 20.00,
        startDate: new Date('2023-10-10 18:00:00'),
        endDate: new Date('2023-10-10 20:00:00')
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Advanced Tiramisu Making',
        description: "For people experienced in the kitchen. Learn step by step how to make this popular dessert.",
        type: 'In Person',
        capacity: 4,
        price: 70.00,
        startDate: new Date('2023-7-11 18:00:00'),
        endDate: new Date('2023-7-11 21:00:00')
      }
     ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     options.tableName = 'Events';
     const Op = Sequelize.Op;
     return queryInterface.bulkDelete(options, {
       name: { [Op.in]: ['Hiking', 'Dancing'] }
     }, {});
  }
};
