class Account {
  constructor(data) {
    if (data === undefined || data === null) {
      this.name = "";
      this.id = null;
    }
    else {
      this.name = data.name;
      this.id = data.id;
    }

  }

  body() {
    return {name: this.name}
  }
}

Account.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateAccount = async (account) => {
    try {
      const body = account.body();
      const response = await fetch(
        `http://localhost:5000/accounts/${account.id}`,
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
    const response = await fetch("http://localhost:5000/accounts", {
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
    const deleteAccount = await fetch(`http://localhost:5000/accounts/${id}`, {
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
    const response = await fetch("http://localhost:5000/accounts");
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
      `http://localhost:5000/accounts/${id}`,
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

const AccountColumns = ['Name',	'LongName',	'Institituion',	'AccountNumber']

export {
  Account,
  AccountColumns,
  updateAccount,
  insertAccount,
  deleteAccount,
  getAccounts,
  getAccount
}
