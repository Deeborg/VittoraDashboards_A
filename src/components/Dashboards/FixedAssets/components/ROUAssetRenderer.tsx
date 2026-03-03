import React from "react";

interface Props {
  rouAssets: any[];
}

const ROUAssetRenderer: React.FC<Props> = ({ rouAssets }) => {
  return (
    <div className="fa-rou-assets-section">
      <h3>Right of Use Assets</h3>
      <ul>
        {rouAssets.map((asset, index) => (
          <li key={index}>
            {asset.name} - ₹{asset.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ROUAssetRenderer;