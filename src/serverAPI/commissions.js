import databaseHost from './database';

class Commission {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.amount = 0;
      this.date = "";
      this.investment = "";
      this.from_investment = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date = data.Date;
      this.amount = data.Amount;
      this.investment = data['Investment'].value.id;
      this.from_investment = data['From Investment'].value.id;
      this.notes = data.Notes;
    }
  }

  body() {
    return {
      date: this.date,
      amount: this.amount,
      investment: this.investment,
      from_investment: this.from_investment,
      notes: this.notes
    };
  }
}

Commission.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const getCommissionsInvestment = async (id) => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/commissions/investment/${id}`,
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

const getCommissionsId = async (id) => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/commissions/id/${id}`,
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

const updateCommission = async (commission) => {
    try {
      const body = commission.body();
      const response = await fetch(
        `http://${databaseHost}:5000/commission/${commission.id}`,
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

const insertCommission = async (commission) => {
  try {
    const body = commission.body();
    console.log(body)
    const response = await fetch(`http://${databaseHost}:5000/commissions`, {
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

const deleteCommission = async id => {
  try {
    const deleteCommission = await fetch(`http://${databaseHost}:5000/commissions/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const CommissionColumns = ['date', 'amount',
  'investment', 'from_investment', 'notes']

export {
  Commission,
  CommissionColumns,
  getCommissionsInvestment,
  getCommissionsId,
  updateCommission,
  insertCommission,
  deleteCommission
}
