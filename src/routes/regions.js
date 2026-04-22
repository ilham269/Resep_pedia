'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/regionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.get('/:slug', ctrl.getBySlug);
router.get('/:slug/recipes', ctrl.getRecipesByRegion);
router.post('/', authenticate, authorize('admin'), ctrl.create);
router.put('/:id', authenticate, authorize('admin'), ctrl.update);

module.exports = router;
