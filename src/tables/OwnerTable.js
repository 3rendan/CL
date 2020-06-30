import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getOwners, OwnerColumns} from '../serverAPI/owners.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const OwnerTable = (props) => {
  const [OwnerData, setOwnerData]  = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getOwners();
      setOwnerData(result);
    }
    fetchData();

  }, []);

  if (OwnerData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Owner"} data={OwnerData}  columns={OwnerColumns}/>);
};

export default OwnerTable;
