'use strict';

const { Recipe, User, Rating } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { paginate, paginationMeta } = require('../utils/paginate');
const { Op } = require('sequelize');

exports.getPendingRecipes = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']], limit, offset,
    });
    return success(res, rows, 'Resep pending', 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

exports.approveRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return error(res, 'Resep tidak ditemukan.', 404);
    await recipe.update({ status: 'published' });
    return success(res, recipe, 'Resep berhasil dipublish.');
  } catch (err) { next(err); }
};

exports.rejectRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return error(res, 'Resep tidak ditemukan.', 404);
    await recipe.update({ status: 'rejected' });
    return success(res, recipe, 'Resep ditolak.');
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = req.query.role ? { role: req.query.role } : {};
    const { count, rows } = await User.findAll({ where, order: [['createdAt', 'DESC']], limit, offset });
    return success(res, rows, 'Semua user', 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'contributor', 'admin'].includes(role)) return error(res, 'Role tidak valid.', 400);
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User tidak ditemukan.', 404);
    await user.update({ role });
    return success(res, user, 'Role user berhasil diupdate.');
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User tidak ditemukan.', 404);
    await user.destroy();
    return success(res, null, 'User berhasil dihapus.');
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalRecipes, totalUsers, pendingRecipes] = await Promise.all([
      Recipe.count({ where: { status: 'published' } }),
      User.count(),
      Recipe.count({ where: { status: 'pending' } }),
    ]);
    return success(res, { totalRecipes, totalUsers, pendingRecipes }, 'Analytics');
  } catch (err) { next(err); }
};
