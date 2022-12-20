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
        description: 'Hike the mountains of Asheville',
        type: 'In Person',
        capacity: 50,
        price: 100,
        startDate: '2023-04-05',
        endDate: '2023-04-06'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Dancing',
        description: 'Group dance class beginner level',
        type: 'In Person',
        capacity: 15,
        price: 40,
        startDate: '2023-07-01',
        endDate: '2023-07-01'
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
