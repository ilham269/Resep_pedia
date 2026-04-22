'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.get('/:slug/recipes', ctrl.getRecipesByCategory);
router.post('/', authenticate, authorize('admin'), ctrl.create);
router.put('/:id', authenticate, authorize('admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
