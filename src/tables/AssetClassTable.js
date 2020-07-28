import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAssetClasses, AssetClassColumns,
        AssetClass, updateAssetClass} from '../serverAPI/assetClass.js'

import {getBenchmarks} from '../serverAPI/benchmarks.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const AssetClassTable = (props) => {
  const [AssetClassData, setAssetClassData]  = useState(null);
  const [BenchmarkData, setBenchmarkData]  = useState([]);
  const [error, setError] = useState(null);

  const colNames = AssetClassColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (colName.includes('Benchmark')) {
      return {title: colName, field: fieldName, responsive: 0, editor:"autocomplete",
              editorParams:{freetext: true, allowEmpty: true, values: BenchmarkData ? BenchmarkData.map(i => i.name) : true},
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
      if (!result) {
        throw 'Server Disconnected: null Asset Classes'
      }
      setAssetClassData(result);

      const benchmarks = await getBenchmarks();
      if (!benchmarks) {
        throw 'Server Disconnected: null Benchmarks'
      }
      setBenchmarkData(benchmarks);
    }
    fetchData().catch(e =>  setError(e) )

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (AssetClassData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Asset Class"} data={AssetClassData}
                       colNames={colNames} columns={AssetClassColumns}/>);
};

export default AssetClassTable;
