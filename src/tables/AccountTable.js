import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAccounts, AccountColumns} from '../serverAPI/accounts.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const AccountTable = (props) => {
  const [AccountData, setAccountData]  = useState(null);

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
  return (<MaintenanceTable name={"Account"} data={AccountData}  columns={AccountColumns}/>);
};

export default AccountTable;
