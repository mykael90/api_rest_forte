/* eslint-disable max-len */
import Sequelize, { Model } from 'sequelize';

export default class MaterialReserveItem extends Model {
  static associate(models) {
    this.belongsTo(models.Material);
    this.belongsTo(models.MaterialReserve);
  }

  static init(sequelize) {
    super.init({

      quantity: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },

      value: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },

    }, {
      sequelize, tableName: 'materials_reserve_items', timestamps: false,
    });

    // ATUALIZAR SALDO DE MATERIAL `LIVRE`E `RESERVADO`
    this.addHook('afterCreate', async (item) => {
      const { releaseInventory, reserveInventory } = await sequelize.models.MaterialInventory.findByPk(item.MaterialId);
      await sequelize.models.MaterialInventory.update({ releaseInventory: Number(releaseInventory) - Number(item.quantity), reserveInventory: Number(reserveInventory) + Number(item.quantity) }, {
        where: {
          materialId: item.MaterialId,
        },
      });
    });

    return this;
  }
}
