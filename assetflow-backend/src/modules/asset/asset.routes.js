const express = require("express");
const router = express.Router();

const assetController = require("./asset.controller");


// Create asset
router.post("/", assetController.createAsset);


// Get all assets
router.get("/", assetController.getAllAssets);


// Get single asset
router.get("/:id", assetController.getAssetById);


// Update asset
router.put("/:id", assetController.updateAsset);


// Delete asset
router.delete("/:id", assetController.deleteAsset);


module.exports = router;