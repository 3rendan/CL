const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

class Owner {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
    }
    else {
      this.id = data.id;
      this.name = data.name;
      this.long_name = data.long_name;
    }
  }

  body() {
    return {name: this.name, long_name: this.long_name}
  }
}

Owner.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateOwner = async (owner) => {
    try {
      const body = owner.body();
      const response = await fetch(
        `http://${databaseHost}:5000/owners/${owner.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
      const jsonData = await response.json();
      if (jsonData.includes('duplicate')) {
        return 'duplicate key';
      }
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  };

const insertOwner = async (owner) => {
  try {
    console.log('trying to insert owners')
    const body = owner.body();
    const response = await fetch(`http://${databaseHost}:5000/owners`, {
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

const deleteOwner = async id => {
  try {
    const deleteOwner = await fetch(`http://${databaseHost}:5000/owners/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getOwners = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/owners`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getOwner = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/owners/${id}`,
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

const OwnerColumns = ['Name', 'Long Name'];
export {
  Owner,
  OwnerColumns,
  updateOwner,
  insertOwner,
  deleteOwner,
  getOwners,
  getOwner
}
