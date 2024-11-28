import React, { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faEye } from "@fortawesome/free-solid-svg-icons";
import AssetDetailsModal from "../assetlists/AssetDetailsModal";

const RecentlyAddedAssets = ({ recentAssets = [], handleAssetDetailsClick }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleViewClick = (asset) => {
    setSelectedAsset(asset);
    if (handleAssetDetailsClick) {
      handleAssetDetailsClick(asset);
    }
  };

  return (
    <div>
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-lg px-3 py-1 uppercase tracking-wide mb-2">
        Recently Added Assets
      </div>
      <div className="p-3 rounded-md">
        {recentAssets.length === 0 ? ( // Handle case where no assets are available
          <p className="text-gray-500 text-sm">No recent assets yet</p>
        ) : (
          recentAssets.slice(0, 3).map((asset, index) => (
            <div
              key={asset.asset_id || index} // Fallback to index if asset_id is missing
              className={`py-1 ${
                index < recentAssets.slice(0, 3).length - 1 ? "border-b" : ""
              } border-gray-200`}
            >
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faBox} className="text-black text-lg" />
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {moment(asset.created_at).format("MMMM DD, YYYY")}
                    </p>
                    <p className="font-bold text-md">
                      {asset.assetName || "Unnamed Asset"}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {asset.assetDetails || "No details available"}
                    </p>
                  </div>
                  <button
                    className="bg-black text-white px-2 py-0.5 rounded-full flex items-center"
                    onClick={() => handleViewClick(asset)}
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-1 text-xs" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAsset && (
        <AssetDetailsModal
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default RecentlyAddedAssets;
