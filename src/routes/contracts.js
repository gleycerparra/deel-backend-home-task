const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const { Op } = require("sequelize");

router.get('/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [
                {
                    ClientId: req.profile.id
                },
                {
                    ContractorId: req.profile.id
                }
            ]
        }
    });
    if (!contract) return res.status(404).end()
    res.json(contract)
})

router.get('/', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const contracts = await Contract.findAll({
        where: {
            status: {
                [Op.not]: 'terminated'
            },
            [Op.or]: [
                {
                    ClientId: req.profile.id
                },
                {
                    ContractorId: req.profile.id
                }
            ]
        }
    });
    res.json(contracts)
})

module.exports = router;