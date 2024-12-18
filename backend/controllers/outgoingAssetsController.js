const OutgoingAsset = require('../models/outgoingassets');
const Asset = require('../models/assets');
const pool = require('../config/database');

const getAllOutgoingAssets = async (req, res) => {
  try {
    console.log('Fetching all outgoing assets...');
    const outgoingAssets = await OutgoingAsset.getAllOutgoingAssets();
    console.log('Fetched outgoing assets:', outgoingAssets);
    res.status(200).json(outgoingAssets);
  } catch (error) {
    console.error('Error fetching outgoing assets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch outgoing assets',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const createOutgoingAsset = async (req, res) => {
  const client = await pool.connect();
  try {
    const { asset_id, quantity, reason, consumed_by } = req.body;
    
    await client.query('BEGIN');

    // Check if asset exists and has sufficient quantity
    const assetResult = await client.query(
      'SELECT * FROM assets WHERE asset_id = $1',
      [asset_id]
    );
    
    if (assetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = assetResult.rows[0];
    if (asset.quantity < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Insufficient quantity',
        available: asset.quantity,
        requested: quantity
      });
    }

    // Update asset quantity
    await client.query(
      'UPDATE assets SET quantity = quantity - $1 WHERE asset_id = $2',
      [quantity, asset_id]
    );

    // Create outgoing asset record
    const outgoingAsset = await OutgoingAsset.createOutgoingAsset({
      asset_id,
      quantity,
      reason,
      consumed_by
    });

    await client.query('COMMIT');
    res.status(201).json(outgoingAsset);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating outgoing asset:', error);
    res.status(500).json({ 
      error: 'Failed to create outgoing asset',
      details: error.message 
    });
  } finally {
    client.release();
  }
};

const updateOutgoingAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAsset = await OutgoingAsset.updateOutgoingAsset(id, req.body);
    if (!updatedAsset) {
      return res.status(404).json({ error: 'Outgoing asset not found' });
    }
    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating outgoing asset:', error);
    res.status(500).json({ 
      error: 'Failed to update outgoing asset',
      details: error.message 
    });
  }
};

const deleteOutgoingAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAsset = await OutgoingAsset.deleteOutgoingAsset(id);
    if (!deletedAsset) {
      return res.status(404).json({ error: 'Outgoing asset not found' });
    }
    res.json({ message: 'Outgoing asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting outgoing asset:', error);
    res.status(500).json({ 
      error: 'Failed to delete outgoing asset',
      details: error.message 
    });
  }
};

module.exports = {
  getAllOutgoingAssets,
  createOutgoingAsset,
  updateOutgoingAsset,
  deleteOutgoingAsset
};
