const express = require('express');
const router = express.Router();

// Importer toutes les routes API
router.use('/auth', require('./auth'));
router.use('/contact', require('./contact'));
router.use('/driver-stats', require('./driver-stats'));
router.use('/fantasy', require('./fantasy'));
router.use('/leagues', require('./leagues'));
router.use('/rankings', require('./rankings'));
router.use('/results', require('./results'));
router.use('/teams', require('./teams'));
router.use('/users', require('./users'));

module.exports = router;