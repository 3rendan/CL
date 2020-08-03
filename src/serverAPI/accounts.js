const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

class Account {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
      this.institution = "";
      this.account_number = "";
    }
    else {
      this.id = data.id;
      this.name = data.name;
      this.long_name = data.long_name;
      this.institution = data.institution;
      this.account_number = data.account_number;
    }

  }

  body() {
    return {name: this.name, long_name: this.long_name,
      institution: this.institution, account_number: this.account_number}
  }
}

Account.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateAccount = async (account) => {
  try {
    const body = account.body();
    const response = await fetch(
      `http://${databaseHost}:5000/accounts/${account.id}`,
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

const insertAccount = async (account) => {
  try {
    const body = account.body();
    const response = await fetch(`http://${databaseHost}:5000/accounts`, {
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

const deleteAccount = async id => {
  try {
    const deleteAccount = await fetch(`http://${databaseHost}:5000/accounts/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getAccounts = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/accounts`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getAccount = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/accounts/${id}`,
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

const AccountColumns = ['Name',	'Long Name',	'Institution',	'Account Number']

export {
  Account,
  AccountColumns,
  updateAccount,
  insertAccount,
  deleteAccount,
  getAccounts,
  getAccount
}
