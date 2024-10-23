const BorrowingRequest = require('../models/borrowingrequest');
const Asset = require('../models/assets');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const BorrowLogs = require('../models/borrowLogs');

exports.createBorrowingRequest = [
  upload.single('coverLetter'),
  async (req, res) => {
    try {
      console.log('Received request:', {
        body: req.body,
        file: req.file,
        headers: req.headers,
        method: req.method,
        url: req.url
      });

      const { name, email, department, purpose, contactNo, selectedAssets, expectedReturnDate, notes } = req.body;
      
      if (!name || !email || !department || !purpose || !contactNo) {
        console.log('Missing required fields:', { name, email, department, purpose, contactNo });
        return res.status(400).json({ message: 'Missing required fields', fields: { name, email, department, purpose, contactNo } });
      }

      let coverLetterPath = null;
      if (req.file) {
        coverLetterPath = req.file.path;
      }

      let parsedSelectedAssets;
      try {
        parsedSelectedAssets = selectedAssets ? JSON.parse(selectedAssets) : [];
      } catch (error) {
        console.error('Error parsing selectedAssets:', error);
        parsedSelectedAssets = [];
      }

      const newRequest = await BorrowingRequest.createBorrowingRequest({
        name,
        email,
        department,
        purpose,
        contactNo,
        coverLetterPath,
        selectedAssets: parsedSelectedAssets,
        expectedReturnDate, // New field
        notes                // New field
      });

      console.log('New borrowing request created:', newRequest);
      res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating borrowing request:', error);
      res.status(500).json({ message: 'Error creating borrowing request', error: error.message });
    }
  }
];

exports.getAllBorrowingRequests = async (req, res) => {
  try {
    const requests = await BorrowingRequest.getAllBorrowingRequests();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrowing requests', error: error.message });
  }
};

exports.updateBorrowingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (status === 'Rejected') {
      await BorrowingRequest.deleteBorrowingRequest(requestId);
      return res.status(200).json({ message: 'Borrowing request rejected and deleted successfully.' });
    }

    // Update the status to Approved
    const updatedRequest = await BorrowingRequest.updateBorrowingRequestStatus(requestId, status);
    if (updatedRequest) {
      // Update asset quantity here
      const selectedAssets = updatedRequest.selected_assets;
      await Promise.all(selectedAssets.map(async (asset) => {
        await Asset.updateAssetQuantity(asset.asset_id, -parseInt(asset.quantity, 10));
      }));

      // Create borrow logs
      for (const asset of selectedAssets) {
        await BorrowLogs.createBorrowLog({
          assetId: asset.asset_id,
          quantityBorrowed: parseInt(asset.quantity, 10),
          borrowerName: updatedRequest.name,
          borrowerEmail: updatedRequest.email,
          borrowerDepartment: updatedRequest.department,
          dateBorrowed: new Date(),
          dateReturned: null,
          borrowingRequestId: requestId
        });
      }

      res.status(200).json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Borrowing request not found' });
    }
  } catch (error) {
    console.error('Error updating borrowing request status:', error);
    res.status(500).json({ message: 'Error updating borrowing request status', error: error.message });
  }
};

exports.getCoverLetter = async (req, res) => {
  try {
    const request = await BorrowingRequest.getBorrowingRequestById(req.params.id);
    if (!request || !request.cover_letter_path) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }
    const absolutePath = path.resolve(request.cover_letter_path);
    
    // Check if the file exists
    await fs.access(absolutePath);
    
    // Set the correct content type for PDF
    res.contentType("application/pdf");
    
    // Stream the file instead of sending it all at once
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    res.status(500).json({ message: 'Error fetching cover letter', error: error.message });
  }
};

exports.returnBorrowingRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await BorrowingRequest.getBorrowingRequestById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    const selectedAssets = request.selected_assets;

    // Update asset quantities back to the original
    await Promise.all(selectedAssets.map(async (asset) => {
      await Asset.updateAssetQuantity(asset.asset_id, asset.quantity);
    }));

    // Update the status of the borrowing request to "Returned"
    const updatedRequest = await BorrowingRequest.updateBorrowingRequestStatus(requestId, 'Returned');

    // Update borrow logs with return date
    await BorrowLogs.updateBorrowLogReturnDate(requestId, new Date());

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error returning assets:', error);
    res.status(500).json({ message: 'Error returning assets', error: error.message });
  }
};
