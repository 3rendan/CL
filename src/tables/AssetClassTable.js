import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAssetClasses, AssetClassColumns,
        AssetClass, updateAssetClass} from '../serverAPI/assetClass.js'

import {getBenchmarks} from '../serverAPI/benchmarks.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const AssetClassTable = (props) => {
  const [AssetClassData, setAssetClassData]  = useState(null);
  const [BenchmarkData, setBenchmarkData]  = useState([]);

  const colNames = AssetClassColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (colName.includes('Benchmark')) {
      return {title: colName, field: fieldName, responsive: 0, editor:"autocomplete",
              editorParams:{freetext: true, allowEmpty: true, values: BenchmarkData.map(i => i.name)},
              cellEdited:function(cell) {
                const newData = cell.getData();
                  const newAssetClass = new AssetClass(newData)
                  updateAssetClass(newAssetClass)
              }};
    }
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             const newAssetClass = new AssetClass(newData)
             updateAssetClass(newAssetClass)
           }
        };
  });

  useEffect(() => {
    async function fetchData() {
      const result = await getAssetClasses();
      setAssetClassData(result);

      const benchmarks = await getBenchmarks();
      setBenchmarkData(benchmarks);
    }
    fetchData();

  }, []);

  if (AssetClassData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Asset Class"} data={AssetClassData}
                       colNames={colNames} columns={AssetClassColumns}/>);
};

export default AssetClassTable;
