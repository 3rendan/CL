const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

class Investment {
  constructor(data) {
    if (data === undefined || data === null) {
      this.id = null;
      this.name = "";
      this.long_name = "";
      this.asset_class = null;
      this.sub_asset_class = null;
      this.account = null;
      this.owner = null;
      this.primary_benchmark = null;
      this.secondary_benchmark = null;
      this.commitment = 0;
      this.size = 0;
      this.end_of_term = null;
      this.management_fee = "";
      this.preferred_return = "";
      this.carried_interest = "";
      this.close_date = null;
      this.sponsor_investment = "";
      this.notes = "";
      this.linked_investment = null;
      this.invest_type = "";
      this.seq_no = 1000.0;
    }
    else {
      this.id = data.id;
      this.name = data.name;
      this.long_name = data.long_name;
      this.asset_class = data.asset_class;
      this.sub_asset_class = data.sub_asset_class;
      this.account = data.account;
      this.owner = data.owner;
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
      this.linked_investment = data.linked_investment;
      this.invest_type = data.invest_type;
      this.seq_no = data.seq_no;
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
            notes: this.notes,
            linked_investment: this.linked_investment,
            invest_type: this.invest_type,
            seq_no: this.seq_no
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
      `http://${databaseHost}:5000/investments/${investment.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    const jsonData = await response.json();
    if (jsonData.includes('duplicate')) {
      return 'duplicate key';
    }
    if (jsonData.includes('foreign key')) {
      return 'foreign key';
    }
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
    const response = await fetch(`http://${databaseHost}:5000/investments`, {
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
    const deleteInvestment = await fetch(`http://${databaseHost}:5000/investments/${id}`, {
      method: "DELETE"
    });
    const jsonData = await deleteInvestment.json();

    if (jsonData === 'Failed! Contains event') {
      return false;
    }
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getInvestments = async () => {
  try {
    const response = await fetch(`http://${databaseHost}:5000/investments`);
    const jsonData = await response.json();
    if (jsonData === 'failure') {
      return false;
    }
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getInvestment = async id => {
  try {
    const response = await fetch(
      `http://${databaseHost}:5000/investments/${id}`,
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
  'Name',	'Long Name',	'Asset Class',	'Sub Asset Class',	'Account',
  'Linked Investment', 'Owner',
  'Invest Type', 'Seq No', 'Primary Benchmark',	'Secondary Benchmark',
  'Commitment',	'Size (M)',	'End of Term',	'Management Fee',
  'Preferred Return',	'Carried Interest',
  'Close Date',	'Sponsor Investment',	'Notes']

const colToInvestmentFields = (columnName) => {
  if (columnName === 'Size (M)') {
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
