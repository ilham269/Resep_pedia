'use strict';

const { User, Recipe, SavedRecipe } = require('../models');
const { uploadImage, deleteImage } = require('../services/uploadService');
const { success, error } = require('../utils/apiResponse');
const { paginate, paginationMeta } = require('../utils/paginate');

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    return success(res, user, 'Profil user');
  } catch (err) { next(err); }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, bio, location } = req.body;
    const user = await User.findByPk(req.user.id);
    await user.update({ name: name || user.name, bio, location });
    return success(res, user, 'Profil berhasil diupdate.');
  } catch (err) { next(err); }
};

// PUT /api/users/me/avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'File gambar wajib diupload.', 400);
    const user = await User.findByPk(req.user.id);
    await deleteImage(user.avatar_url);
    const avatar_url = await uploadImage(req.file.buffer, 'reseppedia/avatars');
    await user.update({ avatar_url });
    return success(res, { avatar_url }, 'Avatar berhasil diupdate.');
  } catch (err) { next(err); }
};

// GET /api/users/me/recipes
exports.getMyRecipes = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      where: { author_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit, offset,
    });
    return success(res, rows, 'Resep saya', 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

// GET /api/users/me/saved
exports.getSaved = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await SavedRecipe.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{ model: Recipe, as: 'recipe' }],
      order: [['createdAt', 'DESC']],
      limit, offset,
    });
    return success(res, rows.map(r => r.recipe).filter(Boolean), 'Resep tersimpan', 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

// DELETE /api/users/me/account
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.destroy({ where: { id: req.user.id } });
    return success(res, null, 'Akun berhasil dihapus.');
  } catch (err) { next(err); }
};

// GET /api/users/:id
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'avatar_url', 'bio', 'location', 'createdAt'],
    });
    if (!user) return error(res, 'User tidak ditemukan.', 404);
    return success(res, user, 'Profil publik');
  } catch (err) { next(err); }
};
