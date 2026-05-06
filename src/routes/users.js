'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const { upload, validateImageBuffer } = require('../middleware/upload');

router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, ctrl.updateMe);
router.put('/me/avatar', authenticate, upload.single('avatar'), validateImageBuffer, ctrl.updateAvatar);
router.get('/me/recipes', authenticate, ctrl.getMyRecipes);
router.get('/me/saved', authenticate, ctrl.getSaved);
router.delete('/me/account', authenticate, ctrl.deleteAccount);
router.get('/:id', ctrl.getPublicProfile);

module.exports = router;
