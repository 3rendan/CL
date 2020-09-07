import moment from 'moment';

const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

class Distribution {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date_due = "";
      this.date_sent = "";
      this.net_amount = 0;
      this.withhold = 0;
      this.recallable = 0;
      this.main = 0;
      this.investment = "";
      this.from_investment = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date_due = data['Date Due'] ? data['Date Due'] : 0;
      this.date_sent = data['Contra Date'] ? data['Contra Date'] : 0;
      this.withhold = data['Withhold $'] ? data['Withhold $'] : 0;
      this.recallable = data['Recallable $'] ? data['Recallable $'] : 0;
      this.main = data['Main $'] ? data['Main $'] : 0;
      this.net_amount = parseFloat(this.recallable) + parseFloat(this.main) +
                        parseFloat(this.withhold);

      if (data['Investment']) {
        try {
          this.investment = data['Investment'].value.id
        }
        catch (e) {
          this.investment = data['Investment']
        }
      }
      else {
        this.investment = data['Investment ID']
      }

      if (data['From Investment']) {
        try {
          this.from_investment = data['From Investment'].value.id
        }
        catch (e) {
          this.from_investment = data['From Investment']
        }
      }
      else {
        this.from_investment = data['From Investment ID']
      }

      this.notes = data.Notes;
    }
  }

  body() {
    return {
      date_due: this.date_due,
      date_sent: this.date_sent,
      net_amount: this.net_amount,
      withhold: this.withhold,
      recallable: this.recallable,
      main: this.main,
      investment: this.investment,
      from_investment: this.from_investment,
      notes: this.notes
    };
  }
}

Distribution.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const getDistributionEventsTime = async (startDate, endDate) => {
  try {
    startDate = moment(startDate).format('LL')
    endDate = moment(endDate).format('LL')
    const response = await fetch(
      `http://${databaseHost}:5000/distributions/${startDate}/${endDate}`,
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

const getAllDistributionEvents = async () => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/distributions`,
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

const getDistributionsInvestment = async (id) => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/distributions/investment/${id}`,
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

const getDistributionsId = async (id) => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/distributions/id/${id}`,
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


const updateDistribution = async (distribution) => {
    try {
      const body = distribution.body();
      const response = await fetch(
        `http://${databaseHost}:5000/distributions/${distribution.id}`,
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

const insertDistribution = async (distribution) => {
  try {
    const body = distribution.body();
    console.log(body)
    const response = await fetch(`http://${databaseHost}:5000/distributions`, {
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

const deleteDistribution = async id => {
  try {
    const deleteDistribution = await fetch(`http://${databaseHost}:5000/distributions/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};



const DistributionColumns = ['date_due', 'date_sent',
              'net_amount', 'withhold', 'recallable',
                      'main', 'from_investment', 'notes']

export {
  Distribution,
  DistributionColumns,
  getDistributionEventsTime,
  getAllDistributionEvents,
  getDistributionsInvestment,
  getDistributionsId,
  updateDistribution,
  insertDistribution,
  deleteDistribution
}
