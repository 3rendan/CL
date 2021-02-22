const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;


const getIrr = async (body) => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/irr`, {
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

const getIrrBenchmark = async (benchmark, body) => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/irr/${benchmark}`, {
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

export {
  getIrr,
  getIrrBenchmark
}
