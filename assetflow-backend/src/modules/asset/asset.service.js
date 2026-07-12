const prisma = require("../config/prisma");


// Get all assets
const getAllAssets = async () => {
    return await prisma.asset.findMany({
        include: {
            category: true
        }
    });
};


// Get asset by ID
const getAssetById = async (id) => {
    return await prisma.asset.findUnique({
        where: {
            id: id
        },
        include: {
            category: true
        }
    });
};


// Create asset
const createAsset = async (data) => {

    const qrToken = `ASSET-${Date.now()}`;

    return await prisma.asset.create({
        data: {
            tag: data.tag,
            name: data.name,
            description: data.description,
            location: data.location,
            categoryId: data.categoryId,
            qrToken: qrToken
        }
    });
};


// Update asset
const updateAsset = async (id, data) => {
    return await prisma.asset.update({
        where: {
            id: id
        },
        data
    });
};


// Delete asset
const deleteAsset = async (id) => {
    return await prisma.asset.delete({
        where: {
            id: id
        }
    });
};


module.exports = {
    getAllAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset
};