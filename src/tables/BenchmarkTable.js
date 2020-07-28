import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getBenchmarks, BenchmarkColumns, updateBenchmark, Benchmark} from '../serverAPI/benchmarks.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const BenchmarkTable = (props) => {
  const [BenchmarkData, setBenchmarkData]  = useState(null);
  const [error, setError] = useState(null);

  const colNames = BenchmarkColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             const newBenchmark = new Benchmark(newData)
             updateBenchmark(newBenchmark)
           }
        };
  });

  useEffect(() => {
    async function fetchData() {
      const result = await getBenchmarks();
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
  return (<MaintenanceTable name={"Benchmark"} data={BenchmarkData}
                     columns={BenchmarkColumns} colNames={colNames} />);
};

export default BenchmarkTable;
