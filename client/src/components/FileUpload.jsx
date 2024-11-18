import React, { useState } from 'react';
import supabase from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first!');
      return;
    }

    try {
      setUploading(true);

      // Create a more structured file name
      const timestamp = new Date().getTime();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special characters
      const fileName = `${timestamp}-${cleanFileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('samplebucket') // Replace with your bucket name
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('samplebucket')
        .getPublicUrl(fileName);

      toast.success('File uploaded successfully!');
      console.log('Public URL:', data.publicUrl);

      // Clear the file input
      setFile(null);
      // You might want to save the URL to your database here

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">File Upload</h2>
      
      <div className="space-y-4">
        {/* File Input */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Choose File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-yellow-50 file:text-yellow-700
              hover:file:bg-yellow-100
              cursor-pointer"
          />
        </div>

        {/* Selected File Name */}
        {file && (
          <div className="text-sm text-gray-600">
            Selected file: {file.name}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${!file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600'
            }
          `}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload; 