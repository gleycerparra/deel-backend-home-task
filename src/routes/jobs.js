const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const { Op } = require("sequelize");
const { sequelize } = require('../model');
const AppException = require("../utils/exception");

router.get('/unpaid', getProfile, async (req, res) => {
    const { Job, Contract } = req.app.get('models')
    const jobs = await Job.findAll({
        include: {
            attributes: [],
            model: Contract,
            where: {
                status: 'in_progress',
                [Op.or]: [
                    {
                        ClientId: req.profile.id
                    },
                    {
                        ContractorId: req.profile.id
                    }
                ]
            }
        },
        where: {
            paid: {
                [Op.not]: true
            }
        }
    });
    res.json(jobs)
})

router.post('/:job_id/pay', getProfile, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { Job, Contract, Profile } = req.app.get('models')
        const { job_id } = req.params
        // validating if given user is a client
        const client = await Profile.findOne({
            where: {
                [Op.and]: [
                    {
                        type: 'client'
                    },
                    {
                        id: req.profile.id
                    }
                ]
            }
        })
        if (!client) return res.status(403).end(`Can't access to this resource as contractor`)
        const job = await Job.findOne({
            include: {
                attributes: ['id', 'ClientId', 'ContractorId'],
                model: Contract,
                where: {
                    [Op.and]: [
                        {
                            ClientId: req.profile.id
                        },
                        {
                            status: 'in_progress',
                        }
                    ]
                }
            },
            where: {
                [Op.and]: [
                    {
                        id: job_id
                    },
                    {
                        paid: {
                            [Op.not]: true
                        }
                    }
                ]
            }
        }, { transaction: t });
        // validating if provided job id exists
        if (!job) throw new AppException(404)
        // if client has not enough balance return an error
        if (client.balance < job.price) throw new AppException(422, 'Not enough balance to pay for this job')
        // set job as paid
        await Job.update({ paid: true }, {
            where: {
                id: job.id
            }
        }, { transaction: t })
        // update client balance
        await Profile.update({ balance: sequelize.literal(`balance - ${job.price}`) }, {
            where: {
                id: job.Contract.ClientId
            }
        }, { transaction: t })
        // update contractor balance
        await Profile.update({ balance: sequelize.literal(`balance + ${job.price}`) }, {
            where: {
                id: job.Contract.ContractorId
            }
        }, { transaction: t })

        await t.commit();

        res.sendStatus(200)
    } catch (err) {
        await t.rollback();

        res.status(err.code || 500).send(err.message)
    }
})

module.exports = router;