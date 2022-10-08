import Sequelize from 'sequelize';

import MaterialIn from '../models/MaterialIn';
import MaterialIntype from '../models/MaterialIntype';
import Material from '../models/Material';
import MaterialInItem from '../models/MaterialInItem';
import User from '../models/User';
import Unidade from '../models/Unidade';

import MaterialRestrict from '../models/MaterialRestrict';
import MaterialRestrictItem from '../models/MaterialRestrictItem';
import MaterialRelease from '../models/MaterialRelease';
import MaterialReleaseItem from '../models/MaterialReleaseItem';

import removeAccent from '../asset/script/removeAccent';

class MaterialInController {
  async store(req, res) {
    try {
      const exists = await MaterialIn.findOne({ where: { req: req.body.req } });

      // VERIFICAR SE ESSA REQUISIÇÃO JÁ FOI RECEBIDA
      if (exists) {
        return res.status(406).json({
          errors: [
            `Recebimento não realizado, requisição ${req.body.req} já cadastrada no banco de dados`,
          ],
        });
      }

      // VERIFICAR SE JÁ TEM OS MATERIAIS CADASTRADOS NO BANCO,
      // SE NÃO TIVER, CADASTRAR AUTOMATICAMENTE
      const items = await Promise.all(
        req.body.items.map(async (item) => ({
          ...item,
          response: await Material.findByPk(item.MaterialId),
        })),
      );

      await items.forEach(async (item) => {
        if (!item.response) {
          await Material.create({
            id: item.MaterialId,
            groupSipac: item.MaterialId.substr(0, 4),
            name: removeAccent(item.name),
            unit: item.unit,
          });
        }
      });

      // ADICIONANDO A REQUISIÇÃO COM OS ITENS PROPRIAMENTE DITA

      const result = await MaterialIn.create(
        {
          materialIntypeId: req.body.materialIntypeId,
          req: req.body.req,
          userId: req.body.userId,
          value: req.body.value,
          requiredBy: req.body.requiredBy,
          reqMaintenance: req.body.reqMaintenance,
          reqUnit: req.body.reqUnit,
          costUnit: req.body.costUnit,
          registerDate: req.body.registerDate,

          MaterialInItems: req.body.items,
        },
        {
          include: [MaterialInItem],
        },
      );

      return res.json(result);
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: [e.message],
      });
    }
  }

  // Index

  async index(req, res) {
    try {
      const result = await MaterialIn.findAll({
        attributes: [
          'id',
          'materialIntypeId',
          'userId',
          [Sequelize.literal('`MaterialIntype`.`type`'), 'type'],
          [Sequelize.literal('`User`.`username`'), 'receivedBy'],
          'req',
          [Sequelize.currencyBr('`MaterialIn`.`value`'), 'value'],

          'requiredBy',
          'reqMaintenance',
          'reqUnit',
          'costUnit',
          [Sequelize.literal('`Unidade`.`sigla`'), 'costUnitSigla'],
          [Sequelize.literal('`Unidade`.`nome_unidade`'), 'costUnitNome'],
          [Sequelize.dataBr('`MaterialIn`.`register_date`'), 'registerDate'],
          [Sequelize.dataBr(
            '`MaterialIn`.`register_date`',
          ),
          'createdAt',
          ],
        ],
        include: [
          {
            model: MaterialInItem,
            attributes: [
              ['material_id', 'materialId'],
              [Sequelize.literal('`MaterialInItems->Material`.`name`'), 'name'],
              [Sequelize.literal('specification'), 'specification'],
              [Sequelize.literal('unit'), 'unit'],
              'quantity',
              [Sequelize.currencyBr('`MaterialInItems`.`value`'), 'value'],
            ],
            required: false,
            include: {
              model: Material,
              attributes: [],
              required: false,
            },
          },
          {
            model: User,
            attributes: [],
            required: false,
          },
          {
            model: Unidade,
            attributes: [],
            required: false,
          },
          {
            model: MaterialIntype,
            required: false,
          },
        ],
      });
      return res.json(result);
    } catch (e) {
      return res.json(e);
    }
  }

  // Show
  async show(req, res) {
    try {
      console.log(JSON.stringify(req.params));
      const { reqMaintenance, year } = req.params;
      const result = await MaterialIn.findAll({
        attributes: [
          'id',
          'materialIntypeId',
          'userId',
          [Sequelize.literal('`MaterialIntype`.`type`'), 'type'],
          [Sequelize.literal('`User`.`username`'), 'receivedBy'],
          'req',
          [Sequelize.currencyBr('`MaterialIn`.`value`'), 'value'],

          'requiredBy',
          'reqMaintenance',
          'reqUnit',
          'costUnit',
          [Sequelize.literal('`Unidade`.`sigla`'), 'costUnitSigla'],
          [Sequelize.literal('`Unidade`.`nome_unidade`'), 'costUnitNome'],
          [
            Sequelize.fn(
              'date_format',
              Sequelize.col('`MaterialIn`.`register_date`'),
              '%d/%m/%Y',
            ),
            'registerDate',
          ],

          [
            Sequelize.fn(
              'date_format',
              Sequelize.col('`MaterialIn`.`created_At`'),
              '%d/%m/%Y',
            ),
            'createdAt',
          ],
        ],
        where: {
          reqMaintenance: `${reqMaintenance}/${year}`,
        },
        include: [
          {
            model: MaterialInItem,
            attributes: [
              ['material_id', 'materialId'],
              [Sequelize.literal('`MaterialInItems->Material`.`name`'), 'name'],
              [Sequelize.literal('specification'), 'specification'],
              [Sequelize.literal('unit'), 'unit'],
              'quantity',
              [
                Sequelize.fn(
                  'format',
                  Sequelize.col('`MaterialInItems`.`value`'),
                  2,
                  'pt_BR',
                ),
                'value',
              ],
            ],
            required: false,
            include: {
              model: Material,
              attributes: [],
              required: false,
            },
          },
          {
            model: User,
            attributes: [],
            required: false,
          },
          {
            model: Unidade,
            attributes: [],
            required: false,
          },
          {
            model: MaterialIntype,
            attributes: [],
            required: false,
          },
        ],
      });
      return res.json(result);
    } catch (e) {
      return res.json(e);
    }
  }

  // Index with Restrictions and Releases

  async indexRL(req, res) {
    try {
      const result = await MaterialIn.findAll({
        attributes: [
          'id',
          'materialIntypeId',
          'userId',
          [Sequelize.literal('`MaterialIntype`.`type`'), 'type'],
          [Sequelize.literal('`User`.`username`'), 'receivedBy'],
          'req',
          [Sequelize.currencyBr('`MaterialIn`.`value`'), 'value'],

          'requiredBy',
          'reqMaintenance',
          'reqUnit',
          'costUnit',
          [Sequelize.literal('`Unidade`.`sigla`'), 'costUnitSigla'],
          [Sequelize.literal('`Unidade`.`nome_unidade`'), 'costUnitNome'],
          [Sequelize.dataBr('`MaterialIn`.`register_date`'), 'registerDate'],
          [Sequelize.dataBr(
            '`MaterialIn`.`register_date`',
          ),
          'createdAt',
          ],
        ],
        include: [
          {
            model: MaterialInItem,
            attributes: [
              ['material_id', 'materialId'],
              [Sequelize.literal('`MaterialInItems->Material`.`name`'), 'name'],
              [Sequelize.literal('`MaterialInItems->Material`.`specification`'), 'specification'],
              [Sequelize.literal('`MaterialInItems->Material`.`unit`'), 'unit'],
              'quantity',
              [
                Sequelize.fn(
                  'format',
                  Sequelize.col('`MaterialInItems`.`value`'),
                  2,
                  'pt_BR',
                ),
                'value',
              ],
            ],
            required: false,
            include: {
              model: Material,
              attributes: [],
              required: false,
            },
          },
          {
            model: MaterialRestrict,
            attributes: [
              'id',
              'userId',
              [Sequelize.literal('`MaterialRestricts->User`.`username`'), 'userName'],
              [Sequelize.dataBr('`MaterialRestricts`.`created_at`'), 'createdAt'],
            ],
            include: [{
              model: MaterialRestrictItem,
              attributes: [
                ['material_id', 'materialId'],
                [Sequelize.literal('`MaterialRestricts->MaterialRestrictItems->Material`.`name`'), 'name'],
                [Sequelize.literal('`MaterialRestricts->MaterialRestrictItems->Material`.`specification`'), 'specification'],
                [Sequelize.literal('`MaterialRestricts->MaterialRestrictItems->Material`.`unit`'), 'unit'],
                'quantity',
                [Sequelize.currencyBr('`MaterialRestricts->MaterialRestrictItems`.`value`'), 'value'],
              ],
              required: false,
              include: {
                model: Material,
                attributes: [],
                required: false,
              },
            }, {
              model: User,
              attributes: [],
              required: false,
            }],
          },
          {
            model: MaterialRelease,
            attributes: [
              'id',
              'userId',
              [Sequelize.literal('`MaterialReleases->User`.`username`'), 'userName'],
              [Sequelize.dataBr('`MaterialReleases`.`created_at`'), 'createdAt'],
            ],
            include: [{
              model: MaterialReleaseItem,
              attributes: [
                ['material_id', 'materialId'],
                [Sequelize.literal('`MaterialReleases->MaterialReleaseItems->Material`.`name`'), 'name'],
                [Sequelize.literal('`MaterialReleases->MaterialReleaseItems->Material`.`specification`'), 'specification'],
                [Sequelize.literal('`MaterialReleases->MaterialReleaseItems->Material`.`unit`'), 'unit'],
                'quantity',
                [Sequelize.currencyBr('`MaterialReleases->MaterialReleaseItems`.`value`'), 'value'],
              ],
              required: false,
              include: {
                model: Material,
                attributes: [],
                required: false,
              },
            }, {
              model: User,
              attributes: [],
              required: false,
            }],
          },
          {
            model: User,
            attributes: [],
            required: false,
          },
          {
            model: Unidade,
            attributes: [],
            required: false,
          },
          {
            model: MaterialIntype,
            required: false,
          },
        ],
      });
      return res.json(result);
    } catch (e) {
      return res.json(e);
    }
  }
}

export default new MaterialInController();
