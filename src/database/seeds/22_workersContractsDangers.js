module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('workers_contracts_dangers', [
      {
        id: 1,
        danger: 'ENERGIA ELÉTRICA',
        percentage: 0.30,
      },
      {
        id: 2,
        danger: 'INFLAMÁVEIS',
        percentage: 0.30,
      },
      {
        id: 3,
        danger: 'EXPLOSIVOS',
        percentage: 0.30,
      },
      {
        id: 4,
        danger: 'VIOLÊNCIA',
        percentage: 0.30,
      },
    ], {});
  },

  async down() {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
