const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require('../model');
const AppException = require('../utils/exception');

router.post('/deposit/:userId', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { Profile, Contract, Job } = req.app.get('models')
        const { userId } = req.params;
        const { amount } = req.body;
        const { dataValues: { totalAmount } } = await Job.findOne({
            attributes: [
                [sequelize.fn('sum', sequelize.col('price')), 'totalAmount']
            ],
            include: {
                attributes: [],
                model: Contract,
                required: true,
                include: {
                    model: Profile,
                    as: 'Client',
                    required: true,
                    where: {
                        id: userId
                    },
                    attributes: [],
                }
            },
            where: {
                paid: {
                    [Op.not]: true
                }
            }
        }, { transaction: t });

        if (amount > (totalAmount * 0.25)) {
            throw new AppException(422, `Can't deposit more than 25% of the total of jobs to pay. Current total: ${totalAmount}`);
        }

        await Profile.update({ balance: sequelize.literal(`balance + ${amount}`) }, {
            where: {
                id: userId
            }
        }, { transaction: t })

        await t.commit();

        res.sendStatus(200);
    } catch (err) {
        await t.rollback();

        res.status(err.code || 500).send(err.message)
    }
})

module.exports = router;