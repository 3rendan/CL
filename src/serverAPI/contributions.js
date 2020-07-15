class Contribution {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date_due = "";
      this.date_sent = "";
      this.net_amount = 0;
      this.fees = 0;
      this.tax = 0;
      this.outside = 0;
      this.other = 0;
      this.investment = "";
      this.from_investment = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date_due = data['Date Due'];
      this.date_sent = data['Date Sent'];

      this.fees = data['Fees $'];
      this.tax = data['Tax $'];
      this.outside = data['Outside $'];
      this.other = data['Other $'];

      this.net_amount = parseFloat(this.fees) + parseFloat(this.tax)
              + parseFloat(this.outside) + parseFloat(this.other);
      this.investment = data['Investment'].value.id;
      this.from_investment = data['From Investment'].value.id;
      this.notes = data.Notes;
    }
  }

  body() {
    return {
      date_due: this.date_due,
      date_sent: this.date_sent,
      net_amount: this.net_amount,
      fees: this.fees,
      tax: this.tax,
      outside: this.outside,
      other: this.other,
      investment: this.investment,
      from_investment: this.from_investment,
      notes: this.notes
    };
  }
}

Contribution.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const getContributionEventsTime = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `http://localhost:5000/contributions/${startDate}/${endDate}`,
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

const getAllContributionEvents = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/contributions`,
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

const getContributionsInvestment = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/contributions/investment/${id}`,
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

const updateContribution = async (contribution) => {
    try {
      const body = contribution.body();
      const response = await fetch(
        `http://localhost:5000/Contribution/${contribution.id}`,
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

const insertContribution = async (contribution) => {
  try {
    const body = contribution.body();
    const response = await fetch("http://localhost:5000/contributions", {
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

const deleteContribution = async id => {
  try {
    const deleteContribution = await fetch(`http://localhost:5000/contributions/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const ContributionColumns = ['date_due', 'date_sent', 'net_amount',
  'fees', 'tax', 'outside', 'other', 'investment', 'from_investment', 'notes']

export {
  Contribution,
  ContributionColumns,
  getContributionEventsTime,
  getAllContributionEvents,
  getContributionsInvestment,
  updateContribution,
  insertContribution,
  deleteContribution
}
