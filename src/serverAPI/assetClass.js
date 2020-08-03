const electron = window.require('electron');
const remote = electron.remote;
const ipcRenderer  = electron.ipcRenderer;

const databaseHost = remote.getGlobal('database').ip;

class AssetClass {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
      this.super_asset_class = "";
      this.primary_benchmark = "";
      this.secondary_benchmark = "";
    }
    else {
      this.id = data.id;
      this.name = data.name
      this.long_name = data.long_name
      this.super_asset_class = data.super_asset_class
      this.primary_benchmark = data.primary_benchmark
      this.secondary_benchmark = data.secondary_benchmark
    }
  }

  body() {
    return {
      name : this.name,
      long_name : this.long_name,
      super_asset_class : this.super_asset_class,
      primary_benchmark : this.primary_benchmark,
      secondary_benchmark : this.secondary_benchmark
    }
  }
}

AssetClass.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateAssetClass = async (assetClass) => {
    try {
      const body = assetClass.body();
      console.log(body)
      const response = await fetch(
        `http://${databaseHost}:5000/assetClasses/${assetClass.id}`,
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

const insertAssetClass = async (assetClass) => {
  try {
    const body = assetClass.body();
    console.log(body)
    console.log('attempt insert assetClass')
    const response = await fetch(`http://${databaseHost}:5000/assetClasses`, {
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

const deleteAssetClass = async id => {
  try {
    const deleteAssetClass = await fetch(`http://${databaseHost}:5000/assetClasses/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getAssetClasses = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/assetClasses`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getAssetClass = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/assetClasses/${id}`,
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


const AssetClassColumns = ['Name', 'Long Name', 'Super Asset Class', 'Primary Benchmark', 'Secondary Benchmark']

export {
  AssetClass,
  AssetClassColumns,
  updateAssetClass,
  insertAssetClass,
  deleteAssetClass,
  getAssetClasses,
  getAssetClass
}
