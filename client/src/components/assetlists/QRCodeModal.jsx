import React, { useRef } from 'react';
import QRCode from 'qrcode.react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faDownload } from "@fortawesome/free-solid-svg-icons";

const QRCodeModal = ({ assetId, assetName, onClose }) => {
  const qrRef = useRef();

  const qrCodeUrl = `${window.location.origin}/scan/${assetId}`;

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assetName}-QRCode.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">{assetName} QR Code</h3>
        <div ref={qrRef} className="flex flex-col items-center">
          <QRCode value={qrCodeUrl} size={200} />
          <p className="mt-4 text-sm text-gray-600 text-center">Scan this QR code to view asset details</p>
        </div>
        <button
          onClick={downloadQRCode}
          className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
