import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getBenchmarks, BenchmarkColumns, updateBenchmark, Benchmark} from '../serverAPI/benchmarks.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const BenchmarkTable = (props) => {
  const [BenchmarkData, setBenchmarkData]  = useState(null);
  const [error, setError] = useState(null);

  const colNames = BenchmarkColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             const newBenchmark = new Benchmark(newData)
             updateBenchmark(newBenchmark).then(a => {
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
      const result = await getBenchmarks();
      if (result === 'failed login') {
        const dialog = electron.remote.dialog
        let options  = {
         buttons: ["Ok"],
         message: 'Login Failed!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        ipcRenderer.send('viewLogin', {});
        return;
      }
      if (!result) {
        throw 'Server Disconnected: null Benchmarks'
      }
      setBenchmarkData(result);

    }
    fetchData().catch(e => setError(e))

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (BenchmarkData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Benchmarks"} data={BenchmarkData}
                     columns={BenchmarkColumns} colNames={colNames} />);
};

export default BenchmarkTable;
