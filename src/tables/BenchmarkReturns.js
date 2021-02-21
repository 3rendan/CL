import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getBenchmarkReturns,
        getBenchmarkReturnsOfBenchmark,
        BenchmarkReturnColumns,
        insertBenchmarkReturn,
        BenchmarkReturns} from '../serverAPI/benchmarkReturns.js'
import {getBenchmarks} from '../serverAPI/benchmarks.js'
import {BenchmarkDropdown} from './popupElements'
import moment from 'moment';

import {initialMoneyPercentFormatter, rightClickMoneyPercent, reportColumnSort} from '../SpecialColumn';

import MaintenanceTable from './benchmarkReturnTable'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const BenchmarkReturnTable = (props) => {
  const [BenchmarkReturnData, setBenchmarkReturnData]  = useState(null);
  const [hasSelected, setSelected] = useState(false);
  const [benchmark, setBenchmark] = useState('Select Benchmark');
  const [benchmarksToID, setBenchmarksToID] = useState({});
  const [idsToBenchmark, setIDsToBenchmark] = useState({});
  const [error, setError] = useState(null);

  const colNames = BenchmarkReturnColumns.map((colName) => {
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    const column = {title: colName, field: fieldName, responsive: 0, minWidth: 200};
    if (fieldName === 'value') {
      column['formatter'] = initialMoneyPercentFormatter;
      column['headerTooltip'] = 'Right Click to toggle cents';
      column['headerSort'] = true;
      column['sorter'] = 'number';
      column['headerContext'] = rightClickMoneyPercent;
    }
    return column;
  });

  useEffect(() => {
    async function fetchBenchmarks() {
      const benchmarks = await getBenchmarks();
      const tempBenchmarksToID = {}
      const tempIDSToBenchmark = {}
      benchmarks.map(benchmark => {
        tempBenchmarksToID[benchmark.name] = benchmark.id;
        tempIDSToBenchmark[benchmark.id] = benchmark.name;
      })
      setBenchmarksToID(tempBenchmarksToID);
      setIDsToBenchmark(tempIDSToBenchmark);
    }

    async function fetchData() {
      await fetchBenchmarks();
      const result = await getBenchmarkReturnsOfBenchmark(benchmarksToID[benchmark]);
      result.map(benchmark => {
        benchmark.benchmark = idsToBenchmark[benchmark.benchmark_id];
        benchmark.date = moment(benchmark.date).format('MM/DD/YYYY')
      })
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
        throw 'Server Disconnected: null acounts'
      }
      setBenchmarkReturnData(result);
    }
    fetchData().catch(e => setError(e))

  }, [benchmark]);
  if (benchmark === 'Select Benchmark') {
    return (
      <>
        <BenchmarkDropdown dropdownOptions={Object.keys(benchmarksToID)}
            setSelected={setSelected} setTransactionType={setBenchmark}/>
        <br/>
      </>
      );
  }
  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  return (
    <>
      <BenchmarkDropdown dropdownOptions={Object.keys(benchmarksToID)}
          setSelected={setSelected} setTransactionType={setBenchmark}/>
      <br/>
      <br/>
      <br/>
      <MaintenanceTable name={"Benchmark Returns"} data={BenchmarkReturnData}
                      colNames={colNames} columns={BenchmarkReturnColumns}/>
    </>);
};

export default BenchmarkReturnTable;
