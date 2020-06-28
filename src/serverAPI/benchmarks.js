class Benchmark {
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }

  body() {
    return {name: this.name}
  }
}

Benchmark.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateBenchmark = async (benchmark) => {
    try {
      const body = benchmark.body();
      const response = await fetch(
        `http://localhost:5000/benchmarks/${benchmark.id}`,
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
    console.log(body)
    console.log('attempt insert benchmark')
    const response = await fetch("http://localhost:5000/benchmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    console.log(response)
    console.log('COMPLETED INSERT')
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const deleteBenchmark = async id => {
  try {
    const deleteBenchmark = await fetch(`http://localhost:5000/benchmarks/${id}`, {
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
    const response = await fetch("http://localhost:5000/benchmarks");
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
      `http://localhost:5000/benchmarks/${id}`,
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

const BenchmarkColumns = ['Name'];
export {
  Benchmark,
  BenchmarkColumns,
  updateBenchmark,
  insertBenchmark,
  deleteBenchmark,
  getBenchmarks,
  getBenchmark
}
