class Transfer {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.amount = 0;
      this.date = "";
      this.investment = "";
      this.notes = "";
      this.type = "";
    }
    else {
      this.id = data.id;
      this.amount = data.Amount;
      this.date = data.Date;
      this.investment = data.Investmemt;
      this.notes = data.Notes;
      this.type = data.Type;
    }
  }

  body() {
    return {
      amount: this.amount,
      date: this.date,
      investment: this.investment,
      notes: this.notes,
      type: this.type
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

const getTransfers = async () => {
  try {
    const response = await fetch("http://localhost:5000/transfers");
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
