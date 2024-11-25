const { executeTransaction } = require("../utils/queryExecutor");

const createAssetsTable = async () => {
	const query = `
CREATE TABLE IF NOT EXISTS Assets (
      asset_id VARCHAR(20) UNIQUE NOT NULL,
      "productCode" VARCHAR(50),
      "assetName" VARCHAR(255) NOT NULL,
      "assetDetails" TEXT,
      category VARCHAR(255),
      location VARCHAR(255),
      quantity BIGINT NOT NULL,
      "totalCost" DECIMAL(20, 2),
      cost DECIMAL(20, 2),
      image TEXT,
      type VARCHAR(50),
      "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT FALSE,
      allocated_quantity BIGINT DEFAULT 0,
      "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      added_by VARCHAR(255),
      quantity_for_borrowing BIGINT DEFAULT 0,
      under_repair BOOLEAN DEFAULT false,
      has_issue BOOLEAN DEFAULT false,
      allow_borrowing BOOLEAN DEFAULT false
    )
  `;
	return executeTransaction([{ query, params: [] }]);
};

const getNextAssetId = async () => {
	const result = await executeTransaction([
		{
				query: "SELECT asset_id FROM Assets ORDER BY asset_id DESC LIMIT 1",
				params: [],
		},
	]);

	if (result.length === 0 || !result[0].asset_id) {
		return "OSA-ASSET-0001";
	}

	const lastAssetId = result[0].asset_id;
	const lastNumber = parseInt(lastAssetId.split("-")[2], 10);
	const nextNumber = lastNumber + 1;
	return `OSA-ASSET-${nextNumber.toString().padStart(4, "0")}`;
};

const createAsset = async (data) => {
	const nextAssetId = await getNextAssetId();
	data.asset_id = nextAssetId;

	const columns = Object.keys(data)
		.map((key) => `"${key}"`)
		.join(", ");
	const values = Object.values(data);
	const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

	const query = `INSERT INTO Assets (${columns}) VALUES (${placeholders}) RETURNING *`;
	return executeTransaction([{ query, params: values }]);
};

const readAssets = async () => {
	const query = "SELECT *, quantity_for_borrowing FROM Assets";
	return executeTransaction([{ query, params: [] }]);
};

const updateAsset = async (id, updates) => {
	try {
		// If trying to change to Consumable type, verify no borrowing quantity
		if (updates.type === "Consumable") {
			const currentAsset = await readAsset(id);
			if (currentAsset && currentAsset.quantity_for_borrowing > 0) {
				throw new Error(
					"Cannot change to Consumable while asset has borrowing quantity"
				);
			}
		}

		// Get current asset data
		const currentAsset = await readAsset(id);
		if (!currentAsset) {
			throw new Error("Asset not found");
		}

		// Only calculate total cost if cost or quantity changes, and quantity_for_borrowing is not changing
		if ((updates.cost !== undefined || updates.quantity !== undefined) && updates.quantity_for_borrowing === undefined) {
			const cost = updates.cost !== undefined ? updates.cost : currentAsset.cost;
			const quantity = updates.quantity !== undefined ? updates.quantity : currentAsset.quantity;
			updates.totalCost = parseFloat(cost) * parseInt(quantity);
		}

		// Create SET clause dynamically from updates object
		const setClause = [];
		const values = [];
		let paramCount = 1;

		// Map of frontend camelCase to database column names
		const columnMapping = {
			productCode: '"productCode"',
			assetName: '"assetName"',
			assetDetails: '"assetDetails"',
			totalCost: '"totalCost"',
			createdDate: '"createdDate"',
			lastUpdated: '"lastUpdated"',
			quantity_for_borrowing: "quantity_for_borrowing",
			is_active: "is_active",
			under_repair: "under_repair",
			has_issue: "has_issue",
		};

		Object.entries(updates).forEach(([key, value]) => {
			if (value === undefined) return;

			// Use mapped column name if it exists, otherwise use the key
			const columnName = columnMapping[key] || key;
			setClause.push(`${columnName} = $${paramCount}`);
			values.push(value);
			paramCount++;
		});

		// Add the asset_id as the last parameter
		values.push(id);

		const query = `
      UPDATE assets 
      SET ${setClause.join(", ")}
      WHERE asset_id = $${paramCount}
      RETURNING *
    `;

		console.log("Update Query:", query);
		console.log("Update Values:", values);

		const result = await executeTransaction([{ query, params: values }]);
		return result[0];
	} catch (error) {
		console.error("Error in updateAsset:", error);
		throw error;
	}
};

const checkActiveBorrowings = async (assetId) => {
	const query = `
    SELECT COUNT(*) as count 
    FROM borrowing_requests 
    WHERE status IN ('Pending', 'Approved') 
    AND selected_assets @> '[{"asset_id": "${assetId}"}]'::jsonb
  `;
	const result = await executeTransaction([{ query, params: [] }]);
	return parseInt(result[0].count) > 0;
};

const deleteAsset = async (id) => {
	try {
		// Create an array of delete operations for all associated tables
		const deleteQueries = [
			{
				query: "DELETE FROM maintenance_records WHERE asset_id = $1",
				params: [id],
			},
			{
				query: "DELETE FROM repair_records WHERE asset_id = $1",
				params: [id],
			},
			{
				query: "DELETE FROM asset_issues WHERE asset_id = $1",
				params: [id],
			},
			{
				query: "DELETE FROM event_assets WHERE asset_id = $1",
				params: [id],
			},
			{
				query: "DELETE FROM borrow_logs WHERE asset_id = $1",
				params: [id],
			},
			{
				query: "DELETE FROM assetactivitylogs WHERE asset_id = $1",
				params: [id],
			},
			{
				query: `DELETE FROM borrowed_assets 
                        WHERE request_id IN (
                            SELECT id FROM borrowing_requests 
                            WHERE selected_assets @> '[{"asset_id": "${id}"}]'::jsonb
                        )`,
				params: [],
			},
			{
				query: `DELETE FROM borrowing_requests 
                        WHERE selected_assets @> '[{"asset_id": "${id}"}]'::jsonb`,
				params: [],
			},
			{
				query: "DELETE FROM Assets WHERE asset_id = $1 RETURNING *",
				params: [id],
			},
		];

		// Execute all delete operations in a transaction
		const results = await executeTransaction(deleteQueries);

		// Return the deleted asset (last query result)
		return results[results.length - 1];
	} catch (error) {
		console.error("Error in deleteAsset:", error);
		throw error;
	}
};

const updateAssetActiveStatus = async (
	assetId,
	isActive,
	quantityForBorrowing = 0
) => {
	const getAssetQuery =
		"SELECT quantity, quantity_for_borrowing FROM Assets WHERE asset_id = $1";
	const assetResult = await executeTransaction([
		{ query: getAssetQuery, params: [assetId] },
	]);

	if (assetResult.length === 0) {
		throw new Error("Asset not found");
	}

	const assetQuantity = assetResult[0].quantity;

	if (isActive) {
		const maxQuantityForBorrowing = Math.min(
			quantityForBorrowing,
			assetQuantity
		);

		const query = `
      UPDATE Assets 
      SET is_active = $1, quantity_for_borrowing = $2, quantity = quantity - $2
      WHERE asset_id = $3 
      RETURNING *
    `;
		return executeTransaction([
			{ query, params: [isActive, maxQuantityForBorrowing, assetId] },
		]);
	} else {
		const query = `
      UPDATE Assets 
      SET is_active = $1, quantity = quantity + $2, quantity_for_borrowing = 0
      WHERE asset_id = $3 
      RETURNING *
    `;
		return executeTransaction([
			{
				query,
				params: [isActive, assetResult[0].quantity_for_borrowing, assetId],
			},
		]);
	}
};

const getTotalActiveAssets = async () => {
	const query = "SELECT COUNT(*) as count FROM Assets WHERE is_active = true";
	const result = await executeTransaction([{ query, params: [] }]);
	return parseInt(result[0].count, 10);
};

const getTotalAvailableAssets = async () => {
	const query = "SELECT COUNT(*) as count FROM Assets WHERE quantity > 0";
	const result = await executeTransaction([{ query, params: [] }]);
	return result[0].count;
};

const getAssetsSortedByActiveStatus = async (sortOrder) => {
	const query = `
    SELECT * FROM Assets
    ORDER BY is_active ${
			sortOrder === "activeFirst" ? "DESC" : "ASC"
		}, "assetName" ASC
  `;
	return executeTransaction([{ query, params: [] }]);
};

const getTotalAssets = async () => {
	const query = "SELECT COUNT(*) as total FROM Assets";
	const result = await executeTransaction([{ query, params: [] }]);
	return parseInt(result[0].total, 10);
};

const getRecentlyAddedAssets = async (limit) => {
	const query =
		'SELECT asset_id, "assetName", "assetDetails", "added_by", "createdDate" FROM Assets ORDER BY "createdDate" DESC LIMIT $1';
	const result = await executeTransaction([{ query, params: [limit] }]);
	return result;
};

const getActiveAssets = async () => {
	const query =
		'SELECT asset_id, "assetName", quantity_for_borrowing FROM Assets WHERE is_active = true';
	return executeTransaction([{ query, params: [] }]);
};

const updateQuantity = async (assetId, newQuantity) => {
	const query =
		"UPDATE assets SET quantity = $1 WHERE asset_id = $2 RETURNING *";
	return executeTransaction([
		{
			query,
			params: [newQuantity, assetId],
		},
	]).then((results) => results[0]);
};

const updateAssetQuantity = async (assetId, quantityChange) => {
	const query = `
    UPDATE Assets 
    SET quantity_for_borrowing = quantity_for_borrowing + $1 
    WHERE asset_id = $2 
      AND (quantity_for_borrowing + $1) >= 0  -- Prevent negative quantity
    RETURNING *
  `;
	const params = [quantityChange, assetId];
	const result = await executeTransaction([{ query, params }]);

	if (result.length === 0) {
		throw new Error("Update would result in negative quantity for borrowing");
	}

	return result;
};

const readAsset = async (assetId) => {
	const query = "SELECT * FROM Assets WHERE asset_id = $1";
	const result = await executeTransaction([{ query, params: [assetId] }]);
	return result[0];
};

// Add this new function
const getTotalAssetsForBorrowing = async () => {
	const query =
		"SELECT COUNT(*) as count FROM Assets WHERE is_active = true AND quantity_for_borrowing > 0";
	const result = await executeTransaction([{ query, params: [] }]);
	return parseInt(result[0].count, 10);
};

// Add this function
const updateRepairStatus = async (assetId, isUnderRepair) => {
	try {
		console.log("Updating repair status:", { assetId, isUnderRepair });

		const query = `
      UPDATE assets 
      SET under_repair = $1
      WHERE asset_id = $2 
      RETURNING *
    `;

		return executeTransaction([
			{
				query,
				params: [isUnderRepair, assetId],
			},
		]);
	} catch (error) {
		console.error("Error in updateRepairStatus:", error);
		throw error;
	}
};

// Add this function
const updateAssetStatus = async (assetId, statusData) => {
	const query = `
    UPDATE Assets 
    SET 
      under_repair = $1,
      has_issue = $2
    WHERE asset_id = $3 
    RETURNING *
  `;
	return executeTransaction([
		{
			query,
			params: [statusData.under_repair, statusData.has_issue, assetId],
		},
	]);
};

// Add this function
const updateAssetIssueStatus = async (assetId, hasIssue) => {
	const query = `
    UPDATE assets 
    SET has_issue = $1
    WHERE asset_id = $2 
    RETURNING *
  `;
	return executeTransaction([{ query, params: [hasIssue, assetId] }]);
};

const updateMainAssetQuantity = async (assetId, quantityDifference) => {
	const query = `
    UPDATE assets
    SET quantity = quantity + $1
    WHERE asset_id = $2
    RETURNING quantity
  `;
	
	try {
		const result = await executeTransaction([{
			query,
			params: [quantityDifference, assetId]
		}]);
		return result[0].quantity;
	} catch (error) {
		console.error('Error updating main asset quantity:', error);
		throw error;
	}
};

const findByProductCode = async (productCode) => {
	// Don't check for duplicates if product code is N/A
	if (productCode === 'N/A') {
		return null;
	}
	const query = 'SELECT * FROM Assets WHERE "productCode" = $1';
	const result = await executeTransaction([{ query, params: [productCode] }]);
	return result[0];
};

module.exports = {
	createAssetsTable,
	createAsset,
	readAssets,
	updateAsset,
	deleteAsset,
	updateAssetActiveStatus,
	getTotalActiveAssets,
	getTotalAvailableAssets,
	getAssetsSortedByActiveStatus,
	getTotalAssets,
	getRecentlyAddedAssets,
	getActiveAssets,
	updateQuantity,
	updateAssetQuantity,
	readAsset,
	getTotalAssetsForBorrowing,
	updateRepairStatus,
	updateAssetStatus,
	updateAssetIssueStatus,
	checkActiveBorrowings,
	updateMainAssetQuantity,
	findByProductCode,
};
