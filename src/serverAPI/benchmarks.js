import databaseHost from './database';

class Benchmark {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
    }
    else {
      this.name = data.name;
      this.long_name = data.long_name;
      this.id = data.id;
    }
  }

  body() {
    return {name: this.name, long_name: this.long_name}
  }
}

Benchmark.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateBenchmark = async (benchmark) => {
    try {
      const body = benchmark.body();
      const _ = await fetch(
        `http://${databaseHost}:5000/benchmarks/${benchmark.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  };

const insertBenchmark = async (benchmark) => {
  try {
    const body = benchmark.body();
    const response = await fetch(`http://${databaseHost}:5000/benchmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const deleteBenchmark = async id => {
  try {
    const _ = await fetch(`http://${databaseHost}:5000/benchmarks/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getBenchmarks = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/benchmarks`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getBenchmark = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/benchmarks/${id}`,
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

const BenchmarkColumns = ['Name', 'Long Name'];
export {
  Benchmark,
  BenchmarkColumns,
  updateBenchmark,
  insertBenchmark,
  deleteBenchmark,
  getBenchmarks,
  getBenchmark
}
