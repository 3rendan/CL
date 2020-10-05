import moment from 'moment';

const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

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
      console.log(data);
      this.id = data.id;
      this.date_due = data['Date Due'];
      this.date_sent = data['Contra Date'];

      this.main = data['Main $'] ? data['Main $'] : 0;
      this.fees = data['Fees $'] ? data['Fees $'] : 0;
      this.tax = data['Tax $'] ? data['Tax $'] : 0;
      this.outside_main = data['Outside Main $'] ? data['Outside Main $'] : 0;
      this.outside_fees = data['Outside Fees $'] ? data['Outside Fees $'] : 0;
      this.outside_tax = data['Outside Tax $'] ? data['Outside Tax $'] : 0;

      this.net_amount = parseFloat(this.main) + parseFloat(this.fees) +
                parseFloat(this.tax) +  parseFloat(this.outside_main) +
                parseFloat(this.outside_fees) + parseFloat(this.outside_tax);

      if (data['Fund Investment']) {
        try {
          this.fund_investment = data['Fund Investment'].value.id
        }
        catch (e) {
          this.fund_investment = data['Fund Investment']
        }
      }
      else {
        this.fund_investment = data['Investment ID']
      }

      if (data['Contra Investment']) {
        try {
          this.contra_investment = data['Contra Investment'].value.id
        }
        catch (e) {
          this.contra_investment = data['Contra Investment']
        }
      }
      else {
        this.contra_investment = data['Contra Investment ID']
      }
      this.notes = data.Notes;
    }
  }
  body() {
    return {
      date_due: this.date_due,
      contra_date: this.date_sent,
      net_amount: this.net_amount,
      main: this.main,
      fees: this.fees,
      tax: this.tax,
      outside_main: this.outside_main,
      outside_fees: this.outside_fees,
      outside_tax: this.outside_tax,
      contra_investment: this.contra_investment,
      fund_investment: this.fund_investment,
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
