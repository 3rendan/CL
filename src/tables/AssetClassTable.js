import React, {Fragment, useState, useEffect, useCallback} from "react";
import ReactDOM from 'react-dom';
import {getAssetClasses, AssetClassColumns,
        AssetClass, updateAssetClass} from '../serverAPI/assetClass.js'

import {getBenchmarks} from '../serverAPI/benchmarks.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

var benchmarkNameToId = {};
var benchmarkNames = [];
var benchmarkIdToName = {};

const AssetClassTable = (props) => {
  const [AssetClassData, setAssetClassData]  = useState(null);
  const [BenchmarkData, setBenchmarkData]  = useState([]);
  const [error, setError] = useState(null);

  const getMemoizedBenchmarkName = useCallback((benchmarks, id) => benchmarks.filter(i => i.id === id)[0].name)

  const colNames = AssetClassColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (colName.includes('Benchmark')) {
      return {title: colName, field: fieldName, responsive: 0, editor:"autocomplete",
              editorParams:{freetext: false, allowEmpty: true, values: benchmarkNames !== [] ? benchmarkNames : true},
              cellEdited:function(cell) {
                  const newData = cell.getData();
                  Object.keys(newData).map(fieldName => {
                    if (fieldName.includes('benchmark')) {
                      if (newData[fieldName] in benchmarkNameToId) {
                        newData[fieldName] = benchmarkNameToId[newData[fieldName]]
                      }
                    }
                    if (newData[fieldName] === '') {
                      newData[fieldName] = null;
                    }
                  })

                  const newAssetClass = new AssetClass(newData)
                  updateAssetClass(newAssetClass)
              }};
    }
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             Object.keys(newData).map(fieldName => {
               if (fieldName.includes('benchmark')) {
                 if (newData[fieldName] in benchmarkNameToId) {
                   newData[fieldName] = benchmarkNameToId[newData[fieldName]]
                 }
               }
               if (newData[fieldName] === '') {
                 newData[fieldName] = null;
               }
             })

             const newAssetClass = new AssetClass(newData)
             updateAssetClass(newAssetClass).then(a => {
               if (a === 'duplicate key') {
                 const electron = window.require('electron');
                 const dialog = electron.remote.dialog
                 let options  = {
                  buttons: ["Ok"],
                  message: 'Names and Long Names are unique!'
                 }
                 const confirmed = dialog.showMessageBoxSync(options)
                 // const confirmed = window.confirm('Confirm Restore?')
                 cell.restoreOldValue();
               }
             });
           }
        };
  });



  useEffect(() => {
    async function fetchData() {
      const benchmarks = await getBenchmarks();
      if (!benchmarks) {
        throw 'Server Disconnected: null Benchmarks'
      }
      setBenchmarkData(benchmarks);

      benchmarkNameToId = {}
      benchmarkIdToName = {}
      benchmarkNames = benchmarks.map(i => {
        benchmarkNameToId[i.name] = i.id
        benchmarkIdToName[i.id]   = i.name
        return i.name;
      })

      const result = await getAssetClasses();
      if (!result) {
        throw 'Server Disconnected: null Asset Classes'
      }
      // HERE IS WHAT IM LOOKING FOR
      result.map(datum => {
        if (datum.primary_benchmark) {
          console.log(datum.primary_benchmark)
          datum.primary_benchmark = getMemoizedBenchmarkName(benchmarks, datum.primary_benchmark)
        }
        if (datum.secondary_benchmark) {
          datum.secondary_benchmark = getMemoizedBenchmarkName(benchmarks, datum.secondary_benchmark)
        }
        return datum;
      })
      setAssetClassData(result);
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
