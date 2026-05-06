'use strict';

const { Op } = require('sequelize');
const { Recipe, User, Category, Region, Country, Ingredient, Step, Rating, Tag, RecipeTag, SavedRecipe } = require('../models');
const { uploadImage, deleteImage } = require('../services/uploadService');
const { uniqueSlug, makeSlug } = require('../utils/slugify');
const { paginate, paginationMeta } = require('../utils/paginate');
const { success, error } = require('../utils/apiResponse');

const recipeIncludes = [
  { model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
  { model: Region, as: 'region', attributes: ['id', 'name', 'slug'] },
  { model: Country, as: 'country', attributes: ['id', 'name', 'code', 'flag_emoji'] },
  { model: Ingredient, as: 'ingredients' },
  { model: Step, as: 'steps', order: [['step_number', 'ASC']] },
  { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
];

// GET /api/recipes
exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { category, region, country, difficulty, minTime, maxTime, sort } = req.query;

    const where = { status: 'published' };
    if (category) where.category_id = category;
    if (region) where.region_id = region;
    if (country) where.country_id = country;
    if (difficulty) where.difficulty = difficulty;
    if (minTime || maxTime) {
      where.cook_time = {};
      if (minTime) where.cook_time[Op.gte] = parseInt(minTime);
      if (maxTime) where.cook_time[Op.lte] = parseInt(maxTime);
    }

    const order = sort === 'popular' ? [['views_count', 'DESC']]
      : sort === 'rating' ? [['rating_avg', 'DESC']]
      : [['createdAt', 'DESC']];

    const { count, rows } = await Recipe.findAndCountAll({
      where, order, limit, offset,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
      ],
      distinct: true,
    });

    return success(res, rows, 'Berhasil mengambil resep', 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

// GET /api/recipes/featured
exports.getFeatured = async (req, res, next) => {
  try {
    const recipes = await Recipe.findAll({
      where: { status: 'published' },
      order: [['rating_avg', 'DESC']],
      limit: 6,
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    return success(res, recipes, 'Resep unggulan');
  } catch (err) { next(err); }
};

// GET /api/recipes/trending
exports.getTrending = async (req, res, next) => {
  try {
    const recipes = await Recipe.findAll({
      where: { status: 'published' },
      order: [['views_count', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    return success(res, recipes, 'Resep trending');
  } catch (err) { next(err); }
};

// GET /api/recipes/search
exports.search = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return error(res, 'Query pencarian wajib diisi.', 400);

    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      },
      limit, offset,
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      distinct: true,
    });
    return success(res, rows, `Hasil pencarian "${q}"`, 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

// GET /api/recipes/:slug
exports.getBySlug = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      where: { slug: req.params.slug, status: 'published' },
      include: recipeIncludes,
    });
    if (!recipe) return error(res, 'Resep tidak ditemukan.', 404);

    // Increment views
    await recipe.increment('views_count');

    return success(res, recipe, 'Detail resep');
  } catch (err) { next(err); }
};

// POST /api/recipes
exports.create = async (req, res, next) => {
  try {
    let { title, description, category_id, region_id, country_id,
      prep_time, cook_time, servings, difficulty, ingredients, steps, tags } = req.body;

    // Parse JSON strings dari FormData
    if (typeof ingredients === 'string') {
      try { ingredients = JSON.parse(ingredients); } catch { ingredients = []; }
    }
    if (typeof steps === 'string') {
      try { steps = JSON.parse(steps); } catch { steps = []; }
    }
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = []; }
    }

    let cover_image_url = null;
    if (req.file) {
      cover_image_url = await uploadImage(req.file.buffer, 'reseppedia/covers');
    }

    const slug = uniqueSlug(title);
    const recipe = await Recipe.create({
      title, slug, description, author_id: req.user.id,
      category_id, region_id, country_id,
      prep_time, cook_time, servings, difficulty,
      cover_image_url, status: 'pending',
    });

    // Bulk create ingredients & steps
    if (ingredients?.length) {
      await Ingredient.bulkCreate(ingredients.map(i => {
        const amount = parseFloat(i.amount);
        return {
          recipe_id: recipe.id,
          name: i.name,
          amount: !isNaN(amount) ? amount : null,
          unit: i.unit || null,
          notes: i.notes || null,
        };
      }));
    }
    if (steps?.length) {
      await Step.bulkCreate(steps.map(s => {
        const duration = parseInt(s.duration_minutes);
        return {
          recipe_id: recipe.id,
          step_number: s.step_number,
          instruction: s.instruction,
          duration_minutes: !isNaN(duration) ? duration : null,
          image_url: s.image_url || null,
        };
      }));
    }

    // Tags
    if (tags?.length) {
      const tagRecords = await Promise.all(tags.map(async (name) => {
        const slug = makeSlug(name);
        const [tag] = await Tag.findOrCreate({ where: { slug }, defaults: { name, slug } });
        return tag;
      }));
      await recipe.setTags(tagRecords);
    }

    const result = await Recipe.findByPk(recipe.id, { include: recipeIncludes });
    return success(res, result, 'Resep berhasil dibuat, menunggu review admin.', 201);
  } catch (err) { next(err); }
};

// PUT /api/recipes/:id
exports.update = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return error(res, 'Resep tidak ditemukan.', 404);
    if (recipe.author_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Akses ditolak.', 403);
    }

    const { title, description, category_id, region_id, country_id,
      prep_time, cook_time, servings, difficulty, ingredients, steps, tags } = req.body;

    if (req.file) {
      await deleteImage(recipe.cover_image_url);
      recipe.cover_image_url = await uploadImage(req.file.buffer, 'reseppedia/covers');
    }

    await recipe.update({
      title: title || recipe.title,
      slug: title ? uniqueSlug(title) : recipe.slug,
      description, category_id, region_id, country_id,
      prep_time, cook_time, servings, difficulty,
      cover_image_url: recipe.cover_image_url,
    });

    if (ingredients?.length) {
      await Ingredient.destroy({ where: { recipe_id: recipe.id } });
      await Ingredient.bulkCreate(ingredients.map(i => ({ ...i, recipe_id: recipe.id })));
    }
    if (steps?.length) {
      await Step.destroy({ where: { recipe_id: recipe.id } });
      await Step.bulkCreate(steps.map(s => ({ ...s, recipe_id: recipe.id })));
    }
    if (tags) {
      const tagRecords = await Promise.all(tags.map(async (name) => {
        const slug = makeSlug(name);
        const [tag] = await Tag.findOrCreate({ where: { slug }, defaults: { name, slug } });
        return tag;
      }));
      await recipe.setTags(tagRecords);
    }

    const result = await Recipe.findByPk(recipe.id, { include: recipeIncludes });
    return success(res, result, 'Resep berhasil diupdate.');
  } catch (err) { next(err); }
};

// DELETE /api/recipes/:id
exports.remove = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return error(res, 'Resep tidak ditemukan.', 404);
    if (recipe.author_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Akses ditolak.', 403);
    }
    await deleteImage(recipe.cover_image_url);
    await recipe.destroy();
    return success(res, null, 'Resep berhasil dihapus.');
  } catch (err) { next(err); }
};

// POST /api/recipes/:id/save
exports.save = async (req, res, next) => {
  try {
    const [saved, created] = await SavedRecipe.findOrCreate({
      where: { user_id: req.user.id, recipe_id: req.params.id },
      defaults: { user_id: req.user.id, recipe_id: req.params.id },
    });
    if (!created) return error(res, 'Resep sudah disimpan.', 409);
    return success(res, null, 'Resep berhasil disimpan.', 201);
  } catch (err) { next(err); }
};

// DELETE /api/recipes/:id/save
exports.unsave = async (req, res, next) => {
  try {
    const deleted = await SavedRecipe.destroy({
      where: { user_id: req.user.id, recipe_id: req.params.id },
    });
    if (!deleted) return error(res, 'Resep tidak ada di koleksi.', 404);
    return success(res, null, 'Resep dihapus dari koleksi.');
  } catch (err) { next(err); }
};

// POST /api/recipes/:id/rating
exports.submitRating = async (req, res, next) => {
  try {
    const { score, review_text } = req.body;
    if (!score || score < 1 || score > 5) return error(res, 'Score harus antara 1-5.', 400);

    const [rating, created] = await Rating.findOrCreate({
      where: { recipe_id: req.params.id, user_id: req.user.id },
      defaults: { recipe_id: req.params.id, user_id: req.user.id, score, review_text },
    });
    if (!created) {
      await rating.update({ score, review_text });
    }

    // Recalculate rating_avg
    const ratings = await Rating.findAll({ where: { recipe_id: req.params.id } });
    const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    await Recipe.update({ rating_avg: avg.toFixed(2) }, { where: { id: req.params.id } });

    return success(res, rating, created ? 'Rating berhasil dikirim.' : 'Rating berhasil diupdate.');
  } catch (err) { next(err); }
};

// GET /api/recipes/:id/ratings
exports.getRatings = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Rating.findAndCountAll({
      where: { recipe_id: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['createdAt', 'DESC']],
      limit, offset,
    });
    return success(res, rows, 'Rating resep', 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

// POST /api/recipes/:id/steps/:stepId/image
exports.uploadStepImage = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'File gambar wajib diupload.', 400);
    const step = await Step.findOne({ where: { id: req.params.stepId, recipe_id: req.params.id } });
    if (!step) return error(res, 'Step tidak ditemukan.', 404);

    const imageUrl = await uploadImage(req.file.buffer, 'reseppedia/steps');
    await step.update({ image_url: imageUrl });
    return success(res, { image_url: imageUrl }, 'Gambar step berhasil diupload.');
  } catch (err) { next(err); }
};
