const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

class Backup {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date = new Date();
    }
    else {
      this.id = data.id;
      this.date = data.date;
    }

  }

  body() {
    return {date: this.date}
  }
}

Backup.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateBackup = async (backup) => {
    try {
      const body = backup.body();
      const response = await fetch(
        `http://${databaseHost}:5000/backups/${backup.id}`,
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

const insertBackup = async (backup) => {
  try {
    const body = backup.body();
    const response = await fetch(`http://${databaseHost}:5000/backups`, {
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

const deleteBackup = async id => {
  try {
    const deleteBackup = await fetch(`http://${databaseHost}:5000/backups/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getBackups = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/backups`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getBackup = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/backups/${id}`,
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

const restore = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/restore/${id}`,
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
}

const BackupColumns = ['Date']

export {
  Backup,
  BackupColumns,
  updateBackup,
  insertBackup,
  deleteBackup,
  getBackups,
  getBackup,
  restore,
}
