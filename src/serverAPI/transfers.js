class Transfer {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date = "";
      this.from_invest = "";
      this.to_invest = "";
      this.amount = 0;
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date = data.date;
      this.from_invest = data.from_invest;
      this.to_invest = data.to_invest;
      this.amount = data.amount;
      this.notes = data.notes;
    }
  }

  body() {
    return {
      date: this.date,
      from_invest: this.from_invest,
      to_invest: this.to_invest,
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
      `http://localhost:5000/transfer/${transfer.id}`,
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
    const response = await fetch("http://localhost:5000/transfers", {
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
    const deleteTransfer = await fetch(`http://localhost:5000/transfers/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getTransfers = async investment => {
  try {
    console.log(investment);
    const response = await fetch(`http://localhost:5000/transfers/${investment}`);
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getTransfer = async id => {
  try {
    const response = await fetch(
      `http://localhost:5000/transfers/${id}`,
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

const TransferColumns = [
  'date', 'from invest', 'to invest', 'amount', 'notes'
];


export {
  Transfer,
  TransferColumns,
  updateTransfer,
  insertTransfer,
  deleteTransfer,
  getTransfers,
  getTransfer
}
