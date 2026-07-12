const assetService = require('./asset.service');
const asyncHandler = require('../../utils/asyncHandler');

const createAsset = asyncHandler(async (req, res) => {
  const { assetTag, categoryId } = req.body;
  const asset = await assetService.createAsset({ assetTag, categoryId });
  res.status(201).json(asset);
});

const listAssets = asyncHandler(async (req, res) => {
  const assets = await assetService.listAssets();
  res.json(assets);
});

module.exports = { createAsset, listAssets };
