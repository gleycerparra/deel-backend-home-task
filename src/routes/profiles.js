const express = require('express');
const router = express.Router();

router.get('/:id', async (req, res) => {
    const { Profile } = req.app.get('models')
    const { id } = req.params
    const profile = await Profile.findOne({ where: { id } });
    if (!profile) return res.status(404).end()
    res.json(profile)
})

router.get('/', async (req, res) => {
    const { Profile } = req.app.get('models')
    const profiles = await Profile.findAll();
    res.json(profiles)
})

module.exports = router;