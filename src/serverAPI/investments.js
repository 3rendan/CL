class Investment {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
      this.asset_class = "";
      this.sub_asset_class = "";
      this.investment = "";
      this.owner = "";
      this.has_commitment = "";
      this.primary_benchmark = "";
      this.secondary_benchmark = "";
      this.commitment = "";
      this.size = "";
      this.end_of_term = "";
      this.management_fee = "";
      this.preferred_return = "";
      this.carried_interest = "";
      this.close_data = "";
      this.sponsor_investment = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.name = data.name;
      this.long_name = data.long_name;
      this.asset_class = data.asset_class;
      this.sub_asset_class = data.sub_asset_class;
      this.investment = data.investment;
      this.owner = data.owner;
      this.has_commitment = data.has_commitment;
      this.primary_benchmark = data.primary_benchmark;
      this.secondary_benchmark = data.secondary_benchmark;
      this.commitment = data.commitment;
      this.size = data.size;
      this.end_of_term = data.end_of_term;
      this.management_fee = data.management_fee;
      this.preferred_return = data.preferred_return;
      this.carried_interest = data.carried_interest;
      this.close_data = data.close_data;
      this.sponsor_investment = data.sponsor_investment;
      this.notes = data.notes;
    }
  }

  body() {
    return {name: this.name}
  }
}

Investment.prototype.toString = function() {
  return JSON.stringify(this.body());
}

const updateInvestment = async (investment) => {
    try {
      const body = investment.body();
      const response = await fetch(
        `http://localhost:5000/investments/${investment.id}`,
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

const insertInvestment = async (investment) => {
  try {
    const body = investment.body();
    const response = await fetch("http://localhost:5000/investments", {
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

const deleteInvestment = async id => {
  try {
    const deleteInvestment = await fetch(`http://localhost:5000/investments/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getInvestments = async () => {
  try {
    const response = await fetch("http://localhost:5000/investments");
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getInvestment = async id => {
  try {
    const response = await fetch(
      `http://localhost:5000/investments/${id}`,
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



const InvestmentColumns = [
  'Name',	'Long Name',	'Asset Class',	'Sub Asset Class',	'Investment',	'Owner',
  'Commitment  (Y/N)', 'Primary Benchmark',	'Secondary Benchmark',
  'Commitment',	'Size (M)',	'End of Term',	'Management Fee',
  'Preferred Return',	'Carried Interest',
  'Close Date',	'Sponsor Investment',	'Notes']


  export {
    Investment,
    InvestmentColumns,
    updateInvestment,
    insertInvestment,
    deleteInvestment,
    getInvestments,
    getInvestment
  }
