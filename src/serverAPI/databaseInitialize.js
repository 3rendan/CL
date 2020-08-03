const initializeDatabase = async (databaseVars) => {
  try {
    const databaseHost = databaseVars.ip;
    const response = await fetch(`http://${databaseHost}:5000/database`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(databaseVars)
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

export default initializeDatabase;
