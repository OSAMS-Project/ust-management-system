const TermsAndConditions = require('../models/termsandcondition');

// Get terms and conditions
exports.getTermsAndConditions = async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne();
    res.json(terms);
  } catch (error) {
    console.error('Error getting terms:', error);
    res.status(500).json({ message: 'Error getting terms and conditions' });
  }
};

// Update terms and conditions
exports.updateTermsAndConditions = async (req, res) => {
  try {
    console.log('Received update request with data:', req.body);
    const terms = await TermsAndConditions.findOneAndUpdate({}, req.body);
    console.log('Updated terms:', terms);
    res.status(200).json(terms);
  } catch (error) {
    console.error('Error updating terms:', error);
    res.status(500).json({ message: 'Error updating terms and conditions' });
  }
};
