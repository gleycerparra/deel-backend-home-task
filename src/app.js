const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const contractsRoutes = require("./routes/contracts");
const jobsRoutes = require("./routes/jobs");
const profilesRoutes = require("./routes/profiles");
const balancesRoutes = require("./routes/balances");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.use('/contracts', contractsRoutes)
app.use('/jobs', jobsRoutes)
app.use('/profiles', profilesRoutes)
app.use('/balances', balancesRoutes)
app.use('/admin', adminRoutes)

module.exports = app;
