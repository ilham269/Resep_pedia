'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tagController');

router.get('/', ctrl.getAll);
router.get('/:slug/recipes', ctrl.getRecipesByTag);

module.exports = router;
