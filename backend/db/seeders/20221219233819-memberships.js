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
     options.tableName = 'Memberships'
     return queryInterface.bulkInsert(options, [
      {
        userId: 1,
        groupId: 2,
        status: 'Member'
      },
      {
        userId: 2,
        groupId: 2,
        status: 'Member'
      },
      {
        userId: 3,
        groupId: 3,
        status: 'Member'
      },
      {
        userId: 1,
        groupId: 3,
        status: 'Not a member'
      },
     ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     options.tableName = 'Memberships';
     const Op = Sequelize.Op;
     return queryInterface.bulkDelete(options, {
       status: { [Op.in]: ['Member', 'Not a member'] }
     }, {});
  }
};