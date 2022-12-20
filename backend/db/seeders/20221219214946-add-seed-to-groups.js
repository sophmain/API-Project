'use strict';

/** @type {import('sequelize-cli').Migration} */

const bcrypt = require('bcryptjs')

let options = {}
if (process.env.NODE_ENV === 'production'){
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
   options.tableName = 'Groups'
   return queryInterface.bulkInsert(options, [
    {
      organizerId: 3,
      name: 'Hiking In Chicago',
      about: 'A group for young adults in Chicago who are looking to socialize in the outdoors',
      type: 'Online',
      private: false,
      city: 'Chicago',
      state: 'IL'
    },
    {
      organizerId: 1,
      name: 'Hip Hop Dancers',
      about: 'Beginner friendly for people who want to learn hip-hop or already love it. All levels welcome.',
      type: 'Online',
      private: false,
      city: 'Los Angeles',
      state: 'CA'
    },
    {
      organizerId: 2,
      name: 'Italian Cooking',
      about: 'Learn to cook like grandma',
      type: 'In person',
      private: true,
      city: 'New York',
      state: 'NY'
    }
   ], {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     options.tableName = 'Groups';
     const Op = Sequelize.Op;
     return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Hiking In Chicago', 'Hip Hop Dancers', 'Italian Cooking'] }
    }, {});
  }
};
