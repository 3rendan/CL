class SingleEntry {
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

SingleEntry.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateSingleEntry = async (singleEntry) => {
    try {
      const body = singleEntry.body();
      const response = await fetch(
        `http://localhost:5000/SingleEntry/${singleEntry.id}`,
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

const insertSingleEntry = async (singleEntry) => {
  try {
    const body = singleEntry.body();
    const response = await fetch("http://localhost:5000/singleEntrys", {
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

const deleteSingleEntry = async id => {
  try {
    const deleteSingleEntry = await fetch(`http://localhost:5000/singleEntrys/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getSingleEntrys = async () => {
  try {
    const response = await fetch("http://localhost:5000/singleEntrys");
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getSingleEntry = async id => {
  try {
    const response = await fetch(
      `http://localhost:5000/singleEntrys/${id}`,
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

const SingleEntryColumns = [
  'amount', 'date',
'investment', 'notes', 'type'
];
export {
  SingleEntry,
  SingleEntryColumns,
  updateSingleEntry,
  insertSingleEntry,
  deleteSingleEntry,
  getSingleEntrys,
  getSingleEntry
}