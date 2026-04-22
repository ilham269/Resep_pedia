'use strict';

const Joi = require('joi');

const recipeSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(2000).optional().allow(''),
  category_id: Joi.number().integer().optional().allow(null),
  region_id: Joi.number().integer().optional().allow(null),
  country_id: Joi.number().integer().optional().allow(null),
  prep_time: Joi.number().integer().min(0).optional().allow(null),
  cook_time: Joi.number().integer().min(0).optional().allow(null),
  servings: Joi.number().integer().min(1).default(2),
  difficulty: Joi.string().valid('mudah', 'sedang', 'sulit').default('mudah'),
  ingredients: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      amount: Joi.number().optional().allow(null),
      unit: Joi.string().optional().allow('', null),
      notes: Joi.string().optional().allow('', null),
    })
  ).min(1).required(),
  steps: Joi.array().items(
    Joi.object({
      step_number: Joi.number().integer().required(),
      instruction: Joi.string().required(),
      duration_minutes: Joi.number().integer().optional().allow(null),
    })
  ).min(1).required(),
  tags: Joi.array().items(Joi.string()).optional(),
});

module.exports = { recipeSchema };
