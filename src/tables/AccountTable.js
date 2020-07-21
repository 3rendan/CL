import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAccounts, AccountColumns, updateAccount, Account} from '../serverAPI/accounts.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const AccountTable = (props) => {
  const [AccountData, setAccountData]  = useState(null);

  const colNames = AccountColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             const newAccount = new Account(newData)
             updateAccount(newAccount)
           }
        };
  });

  useEffect(() => {
    async function fetchData() {
      const result = await getAccounts();
      setAccountData(result);
    }
    fetchData();

  }, []);

  if (AccountData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Account"} data={AccountData}
                    colNames={colNames} columns={AccountColumns}/>);
};

export default AccountTable;
