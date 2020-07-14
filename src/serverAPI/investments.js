class Investment {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
      this.asset_class = "";
      this.sub_asset_class = "";
      this.account = "";
      this.owner = "";
      this.has_commitment = false;
      this.primary_benchmark = "";
      this.secondary_benchmark = "";
      this.commitment = 0;
      this.size = 0;
      this.end_of_term = null;
      this.management_fee = "";
      this.preferred_return = "";
      this.carried_interest = "";
      this.close_date = null;
      this.sponsor_investment = "";
      this.notes = "";
    }
    else {
      this.id = data.id;
      this.name = data.name;
      this.long_name = data.long_name;
      this.asset_class = data.asset_class;
      this.sub_asset_class = data.sub_asset_class;
      this.account = data.account;
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
      this.close_date = data.close_date;
      this.sponsor_investment = data.sponsor_investment;
      this.notes = data.notes;
    }
  }

  body() {
    return {
            name: this.name,
            long_name: this.long_name,
            asset_class: this.asset_class,
            sub_asset_class: this.sub_asset_class,
            account: this.account,
            owner: this.owner,
            has_commitment: this.has_commitment,
            primary_benchmark: this.primary_benchmark,
            secondary_benchmark: this.secondary_benchmark,
            commitment: this.commitment,
            size: this.size,
            end_of_term: this.end_of_term,
            management_fee: this.management_fee,
            preferred_return: this.preferred_return,
            carried_interest: this.carried_interest,
            close_date: this.close_date,
            sponsor_investment: this.sponsor_investment,
            notes: this.notes
          }
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
    console.log(body)
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
  'Name',	'Long Name',	'Asset Class',	'Sub Asset Class',	'Account',	'Owner',
  'Commitment (Y/N)', 'Primary Benchmark',	'Secondary Benchmark',
  'Commitment',	'Size (M)',	'End of Term',	'Management Fee',
  'Preferred Return',	'Carried Interest',
  'Close Date',	'Sponsor Investment',	'Notes']

const colToInvestmentFields = (columnName) => {
  if (columnName === 'Commitment (Y/N)') {
    return 'has_commitment';
  }
  else if (columnName === 'Size (M)') {
    return 'size';
  }
  return columnName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
}

  export {
    Investment,
    InvestmentColumns,
    colToInvestmentFields,
    updateInvestment,
    insertInvestment,
    deleteInvestment,
    getInvestments,
    getInvestment
  }
