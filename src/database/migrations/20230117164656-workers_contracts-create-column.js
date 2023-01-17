module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'workers_contracts', // table name
        'worker_contract_regime_id', // new field name
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'workers_contracts_regimes',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
      )]);
  },

  down() {
  },
};
