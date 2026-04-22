'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Semua route admin wajib login + role admin
router.use(authenticate, authorize('admin'));

router.get('/recipes/pending', ctrl.getPendingRecipes);
router.put('/recipes/:id/approve', ctrl.approveRecipe);
router.put('/recipes/:id/reject', ctrl.rejectRecipe);

router.get('/users', ctrl.getUsers);
router.put('/users/:id/role', ctrl.updateUserRole);
router.delete('/users/:id', ctrl.deleteUser);

router.get('/analytics', ctrl.getAnalytics);

module.exports = router;
