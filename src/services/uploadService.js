'use strict';

const cloudinary = require('../config/cloudinary');

const uploadImage = (buffer, folder = 'reseppedia') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  // Extract public_id dari URL cloudinary
  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${filename}`;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
