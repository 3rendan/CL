const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

class BenchmarkReturn {
  constructor(data) {
    if (data === undefined || data === null) {
      this.benchmark_id = null;
      this.date = "";
      this.value = "";
    }
    else {
      this.date = data.date;
      this.value = data.value;
      this.benchmark_id = data.benchmark_id;
    }
  }

  body() {
    return {name: this.name,
            long_name: this.long_name}
  }
}

BenchmarkReturn.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const insertBenchmarkReturn = async (benchmark) => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/benchmarkReturns/${benchmark.benchmark_id}/${benchmark.date}/${benchmark.value}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    const jsonData = await response.json();
    if (jsonData.includes('duplicate')) {
      return 'duplicate key';
    }
    if (jsonData.includes('foreign')) {
      return 'foreign key';
    }
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getBenchmarkReturns = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/benchmarkReturns`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getBenchmarkReturnsOfBenchmark = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/benchmarkReturns/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );
    const jsonData = await response.json();

    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const BenchmarkReturnColumns = ['Benchmark', 'Date', 'Value'];
export {
  BenchmarkReturn,
  BenchmarkReturnColumns,
  insertBenchmarkReturn,
  getBenchmarkReturns,
  getBenchmarkReturnsOfBenchmark
}
