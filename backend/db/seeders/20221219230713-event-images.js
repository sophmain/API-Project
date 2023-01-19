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
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC7WCH31Rnp5bwmG1HnqIuNY1hffPEY7bjFQ&usqp=CAU',
        preview: true
      },
      {
        eventId: 2,
        url: 'https://www.starrstudiossalem.com/wp-content/uploads/2018/01/Hip-Hop-5.jpg',
        preview: true
      },
      {
        eventId: 3,
        url: 'https://www.inspiredtaste.net/wp-content/uploads/2019/03/Spaghetti-with-Meat-Sauce-Recipe-1-1200.jpg',
        preview: true
      },
      {
        eventId: 4,
        url: 'https://static01.nyt.com/images/2017/04/05/dining/05COOKING-TIRAMISU1/05COOKING-TIRAMISU1-articleLarge.jpg',
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
