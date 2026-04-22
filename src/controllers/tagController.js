'use strict';

const { Tag, Recipe } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { paginate, paginationMeta } = require('../utils/paginate');

exports.getAll = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({ order: [['name', 'ASC']] });
    return success(res, tags, 'Semua tag');
  } catch (err) { next(err); }
};

exports.getRecipesByTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ where: { slug: req.params.slug } });
    if (!tag) return error(res, 'Tag tidak ditemukan.', 404);
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      include: [{ model: Tag, as: 'tags', where: { id: tag.id }, through: { attributes: [] } }],
      where: { status: 'published' },
      limit, offset, distinct: true,
    });
    return success(res, rows, `Resep dengan tag ${tag.name}`, 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};
