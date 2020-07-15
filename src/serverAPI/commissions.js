class Commission {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date = "";
      this.invest = "";
      this.from_invest = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date = data.Date;
      this.invest = data['Investment'].value.id;
      this.from_invest = data['From Investment'].value.id;
      this.notes = data.Notes;
    }
  }

  body() {
    return {
      date: this.date,
      amount: this.amount,
      invest: this.invest,
      from_invest: this.from_invest,
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
      `http://localhost:5000/commissions/investment/${id}`,
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
        `http://localhost:5000/commission/${commission.id}`,
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
    const response = await fetch("http://localhost:5000/commissions", {
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
    const deleteCommission = await fetch(`http://localhost:5000/commissions/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const CommissionColumns = ['date', 'amount',
  'investment', 'from_invest', 'notes']

export {
  Commission,
  CommissionColumns,
  getCommissionsInvestment,
  updateCommission,
  insertCommission,
  deleteCommission
}
