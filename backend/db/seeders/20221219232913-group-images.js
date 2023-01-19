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
    options.tableName = 'GroupImages'
    return queryInterface.bulkInsert(options, [
      {
        groupId: 1,
        url: 'https://urbanoutdoors.com/wp-content/uploads/2019/08/34208529984_0062a52df1_k.jpg',
        preview: true
      },
      {
        groupId: 2,
        url: 'https://global-uploads.webflow.com/5e2b8863ba7fff8df8949888/6165a3bff4efbdd9e5dc8cd3_bam-martin-limelight-sbu-beats-basic.jpg',
        preview: true
      },
      {
        groupId: 3,
        url: 'https://www.hotelmousai.com/blog/wp-content/uploads/2021/12/Top-10-Traditional-Foods-in-Italy-1140x694.jpg',
        preview: true
      },
      {
        groupId: 4,
        url: 'https://uploads.guidedogs.ie/400x0/filters:quality(60):format(webp)/f/106081/4769x2683/e2dd940bcc/lulu-v-litter-17.jpg',
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
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['fakeurl1', 'fakeurl2', 'fakeurl3'] }
    }, {});
  }
};
