const Supplier = require('../models/supplier');
const SupplierActivityLog = require('../models/supplieractivitylogs');

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const oldSupplier = await Supplier.readSupplier(id);
    const result = await Supplier.updateSupplier(req.body, id);
    
    // Log changes
    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (oldSupplier[key] !== req.body[key]) {
        changes[key] = {
          oldValue: oldSupplier[key],
          newValue: req.body[key]
        };
      }
    });


    if (Object.keys(changes).length > 0) {
      await createSupplierActivityLog({
        body: {
          supplier_id: id,
          action: 'update',
          changes: changes
        }
      }, res);
    }

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error updating supplier", details: err.toString() });
  }
};

const getSupplierActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Backend: Fetching activity logs for supplier ID:", id);
    const logs = await SupplierActivityLog.getSupplierActivityLogs(id);
    console.log("Backend: Retrieved logs:", logs);
    res.json(logs);
  } catch (err) {
    console.error("Backend Error in getSupplierActivityLogs:", {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: "Error fetching supplier activity logs", details: err.toString() });
  }
};

const createSupplierActivityLog = async (req, res) => {
  try {
    const { supplier_id, action, changes } = req.body;
    console.log("Backend: Creating activity log for supplier:", {
      supplier_id,
      action,
      changes
    });

    const logs = await Promise.all(
      Object.entries(changes)
        .filter(([field, { oldValue, newValue }]) => {
          return oldValue !== newValue;
        })
        .map(([field, { oldValue, newValue }]) => {
          return SupplierActivityLog.logSupplierActivity(
            supplier_id, 
            action, 
            field, 
            oldValue?.toString() || '', 
            newValue?.toString() || ''
          );
        })
    );
    
    res.status(201).json(logs);
  } catch (err) {
    console.error("Backend Error in createSupplierActivityLog:", {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: "Error creating supplier activity log", details: err.toString() });
  }
};

module.exports = {
  updateSupplier,
  getSupplierActivityLogs,
  createSupplierActivityLog,
}; 