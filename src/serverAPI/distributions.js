import moment from 'moment';

class Distribution {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.date_due = "";
      this.date_sent = "";
      this.net_amount = 0;
      this.withhold = 0;
      this.recallable = 0;
      this.other = 0;
      this.from_invest = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.date_due = data['Date Due'];
      this.date_sent = data['Date Sent'];
      this.withhold = data['Withhold $'];
      this.recallable = data['Recallable $'];
      this.other = data['Other $'];
      this.net_amount = parseFloat(this.withhold) + parseFloat(this.recallable) + parseFloat(this.other);
      this.from_invest = data['From Investment'].value.id;
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
      other: this.other,
      from_invest: this.from_invest,
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
      `http://localhost:5000/distributions/${startDate}/${endDate}`,
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
      `http://localhost:5000/distributions`,
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
        `http://localhost:5000/Distribution/${distribution.id}`,
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
    const response = await fetch("http://localhost:5000/distributions", {
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
    const deleteDistribution = await fetch(`http://localhost:5000/distributions/${id}`, {
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
                      'other', 'from_invest', 'notes']

export {
  Distribution,
  DistributionColumns,
  getDistributionEventsTime,
  getAllDistributionEvents,
  updateDistribution,
  insertDistribution,
  deleteDistribution
}
