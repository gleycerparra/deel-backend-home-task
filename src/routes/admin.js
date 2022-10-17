const express = require('express');
const router = express.Router();
const { QueryTypes } = require("sequelize");
const { sequelize } = require('../model');

router.get('/best-profession', async (req, res) => {
    const { start, end } = req.query;

    const results = await sequelize.query(`
        SELECT Profiles.profession, 
        SUM(Jobs.price) AS totalAmount 
        FROM Profiles 
        INNER JOIN Contracts ON Profiles.id = Contracts.ContractorId 
        INNER JOIN Jobs ON Contracts.id = Jobs.ContractId AND Jobs.paid = true
        WHERE Jobs.paymentDate BETWEEN :start AND :end
        GROUP BY Profiles.profession
        ORDER BY totalAmount DESC
        LIMIT 1`, {
        replacements: {
            start: `${start} 00:00:00`,
            end: `${end} 23:59:59`
        },
        type: QueryTypes.SELECT
    });

    res.json(results);
})


router.get('/best-clients', async (req, res) => {
    const { start, end, limit } = req.query;

    const results = await sequelize.query(`
        SELECT 
        Profiles.id,
        Profiles.firstName || ' ' || Profiles.lastName AS fullName,
        SUM(Jobs.price) AS paid 
        FROM Profiles 
        INNER JOIN Contracts ON Profiles.id = Contracts.ClientId 
        INNER JOIN Jobs ON Contracts.id = Jobs.ContractId AND Jobs.paid = true
        WHERE Jobs.paymentDate BETWEEN :start AND :end
        GROUP BY Profiles.id
        ORDER BY paid DESC
        LIMIT :limit`, {
        replacements: {
            start: `${start} 00:00:00`,
            end: `${end} 23:59:59`,
            limit
        },
        type: QueryTypes.SELECT
    });

    res.json(results);
})

module.exports = router;