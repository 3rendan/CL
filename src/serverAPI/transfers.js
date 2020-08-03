import databaseHost from './database';

class Transfer {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date = "";
      this.from_investment = "";
      this.to_investment = "";
      this.amount = 0;
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date = data.Date;
      this.from_investment = data['From Investment'].value.id;
      this.to_investment = data['To Investment'].value.id;
      this.amount = data.Amount;
      this.notes = data.Notes;
    }
  }

  body() {
    return {
      date: this.date,
      from_investment: this.from_investment,
      to_investment: this.to_investment,
      amount: this.amount,
      notes: this.notes
    };
  }
}

Transfer.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateTransfer = async (transfer) => {
  try {
    const body = transfer.body();
    const response = await fetch(
      `http://${databaseHost}:5000/transfer/${transfer.id}`,
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

const insertTransfer = async (transfer) => {
  try {
    const body = transfer.body();
    const response = await fetch(`http://${databaseHost}:5000/transfers`, {
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

const deleteTransfer = async id => {
  try {
    const deleteTransfer = await fetch(`http://${databaseHost}:5000/transfers/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getAllTransfers = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/transfers`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getTransfers = async (id) => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/transfers/${id}`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getTransfersId = async (id) => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/transfers/id/${id}`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const TransferColumns = [
  'Date', 'From Investment', 'To Investment', 'Amount', 'Notes'
];


export {
  Transfer,
  TransferColumns,
  updateTransfer,
  insertTransfer,
  deleteTransfer,
  getTransfers,
  getAllTransfers,
  getTransfersId
}
