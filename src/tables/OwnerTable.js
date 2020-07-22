import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getOwners, OwnerColumns, Owner, updateOwner} from '../serverAPI/owners.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const OwnerTable = (props) => {
  const [OwnerData, setOwnerData]  = useState(null);

  let colNames = OwnerColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             const newOwner = new Owner(newData)
             updateOwner(newOwner)
           }
        };
  });

  useEffect(() => {
    async function fetchData() {
      const result = await getOwners();
      console.log(result)
      setOwnerData(result);
    }
    fetchData();

  }, []);

  if (OwnerData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Owner"} data={OwnerData}
              columns={OwnerColumns} colNames={colNames}/>);
};

export default OwnerTable;
