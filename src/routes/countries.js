'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/countryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.get('/:code/recipes', ctrl.getRecipesByCountry);
router.post('/', authenticate, authorize('admin'), ctrl.create);

module.exports = router;
