import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getBenchmarks, BenchmarkColumns} from './serverAPI/benchmarks.js'

import MaintenanceTable from './maintenance/AssetsBenchmarksOwners'

const BenchmarkTable = (props) => {
  const [BenchmarkData, setBenchmarkData]  = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getBenchmarks();
      setBenchmarkData(result);
    }
    fetchData();

  }, []);

  if (BenchmarkData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Benchmark"} data={BenchmarkData}  columns={BenchmarkColumns}/>);
};

export default BenchmarkTable;
