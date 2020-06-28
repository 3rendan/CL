class AssetClass {
  constructor(id, name, long_name, super_asset_class, primary_benchmark_id, secondary_benchmark_id) {
    this.name = name
    this.long_name = long_name
    this.super_asset_class = super_asset_class
    this.primary_benchmark_id = primary_benchmark_id
    this.secondary_benchmark_id = secondary_benchmark_id
    this.id = id;
  }

  body() {
    return {
      name : this.name,
      long_name : this.long_name,
      super_asset_class : this.super_asset_class,
      primary_benchmark_id : this.primary_benchmark_id,
      secondary_benchmark_id : this.secondary_benchmark_id
    }
  }
}

AssetClass.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateAssetClass = async (assetClass) => {
    try {
      const body = assetClass.body();
      const response = await fetch(
        `http://localhost:5000/assetClasses/${assetClass.id}`,
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
    const response = await fetch("http://localhost:5000/assetClasses", {
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

const deleteAssetClass = async id => {
  try {
    const deleteAssetClass = await fetch(`http://localhost:5000/assetClasses/${id}`, {
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
    const response = await fetch("http://localhost:5000/assetClasses");
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
      `http://localhost:5000/assetClasses/${id}`,
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
