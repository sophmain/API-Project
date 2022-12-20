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
    options.tableName = 'EventImages'
    return queryInterface.bulkInsert(options, [
      {
        eventId: 1,
        url: 'fakeurl4',
        preview: true
      },
      {
        eventId: 2,
        url: 'fakeurl5',
        preview: false
      },
      {
        eventId: 2,
        url: 'fakeurl6',
        preview: true
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['fakeurl4', 'fakeurl5', 'fakeurl6'] }
    }, {});
  }
};
