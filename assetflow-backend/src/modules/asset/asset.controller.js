const assetService = require("./asset.service");


// Create asset
const createAsset = async (req, res) => {
    try {
        const asset = await assetService.createAsset(req.body);

        res.status(201).json(asset);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get all assets
const getAllAssets = async (req, res) => {
    try {
        const assets = await assetService.getAllAssets();

        res.status(200).json(assets);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get asset by ID
const getAssetById = async (req, res) => {
    try {
        const asset = await assetService.getAssetById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.status(200).json(asset);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Update asset
const updateAsset = async (req, res) => {
    try {
        const asset = await assetService.updateAsset(
            req.params.id,
            req.body
        );

        res.status(200).json(asset);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Delete asset
const deleteAsset = async (req, res) => {
    try {
        await assetService.deleteAsset(req.params.id);

        res.status(200).json({
            message: "Asset deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createAsset,
    getAllAssets,
    getAssetById,
    updateAsset,
    deleteAsset
};