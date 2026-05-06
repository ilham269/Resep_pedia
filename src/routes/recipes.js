'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipeController');
const authenticate = require('../middleware/authenticate');
const { upload, validateImageBuffer } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { recipeSchema } = require('../validators/recipeSchema');

router.get('/', ctrl.getAll);
router.get('/featured', ctrl.getFeatured);
router.get('/trending', ctrl.getTrending);
router.get('/search', ctrl.search);
router.get('/:slug', ctrl.getBySlug);

router.post('/', authenticate, upload.single('cover_image'), validateImageBuffer, validate(recipeSchema), ctrl.create);
router.put('/:id', authenticate, upload.single('cover_image'), validateImageBuffer, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

router.post('/:id/save', authenticate, ctrl.save);
router.delete('/:id/save', authenticate, ctrl.unsave);

router.post('/:id/rating', authenticate, ctrl.submitRating);
router.get('/:id/ratings', ctrl.getRatings);

router.post('/:id/steps/:stepId/image', authenticate, upload.single('image'), validateImageBuffer, ctrl.uploadStepImage);

module.exports = router;