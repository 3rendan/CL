import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAssetClasses, AssetClassColumns} from './serverAPI/assetClass.js'

import MaintenanceTable from './maintenance/AssetsBenchmarksOwners'

const AssetClassTable = (props) => {
  const [AssetClassData, setAssetClassData]  = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getAssetClasses();
      setAssetClassData(result);
    }
    fetchData();

  }, []);

  if (AssetClassData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Asset Class"} data={AssetClassData}  columns={AssetClassColumns}/>);
};

export default AssetClassTable;
