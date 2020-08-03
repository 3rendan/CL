import databaseHost from './database';
import moment from 'moment';

class Contribution {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date_due = "";
      this.date_sent = "";
      this.net_amount = 0;
      this.main = 0;
      this.fees = 0;
      this.tax = 0;
      this.outside_main = 0;
      this.outside_fees = 0;
      this.outside_tax = 0;
      this.investment = "";
      this.from_investment = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date_due = data['Date Due'];
      this.date_sent = data['Date Sent'];

      this.main = data['Main $'];
      this.fees = data['Fees $'];
      this.tax = data['Tax $'];
      this.outside_main = data['Outside Main $'];
      this.outside_fees = data['Outside Fees $'];
      this.outside_tax = data['Outside Tax $'];

      this.net_amount = parseFloat(this.main) + parseFloat(this.fees) +
                parseFloat(this.tax) +  parseFloat(this.outside_main) +
                parseFloat(this.outside_fees) + parseFloat(this.outside_tax);
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
      main: this.main,
      fees: this.fees,
      tax: this.tax,
      outside_main: this.outside_main,
      outside_fees: this.outside_fees,
      outside_tax: this.outside_tax,
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
    startDate = moment(startDate).format('LL')
    endDate = moment(endDate).format('LL')
    const response = await fetch(
      `http://${databaseHost}:5000/contributions/${startDate}/${endDate}`,
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
      `http://${databaseHost}:5000/contributions`,
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
      `http://${databaseHost}:5000/contributions/investment/${id}`,
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

const getContributionsId = async (id) => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/contributions/id/${id}`,
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
        `http://${databaseHost}:5000/contributions/${contribution.id}`,
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
    const response = await fetch(`http://${databaseHost}:5000/contributions`, {
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
    const deleteContribution = await fetch(`http://${databaseHost}:5000/contributions/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const ContributionColumns = ['date_due', 'date_sent', 'net_amount',
                    'main', 'fees', 'tax',
                    'outside_main', 'outside_fees', 'outside_tax',
                      'investment', 'from_investment', 'notes']

export {
  Contribution,
  ContributionColumns,
  getContributionEventsTime,
  getAllContributionEvents,
  getContributionsInvestment,
  getContributionsId,
  updateContribution,
  insertContribution,
  deleteContribution
}
