'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')

let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA
}

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    options.tableName = 'Venues'
    return queryInterface.bulkInsert(options, [
      {
        groupId: 1,
        address: '123 Willow Ln',
        city: 'Asheville',
        state: 'NC',
        lat: 66.54,
        lng: 88.09
      },
      {
        groupId: 2,
        address: '456 Skip Dr',
        city: 'Los Angeles',
        state: 'CA',
        lat: 90.76,
        lng: 123.45
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Venues';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: { [Op.in]: ['123 Willow Ln', '456 Skip Dr'] }
    }, {});
  }
};
