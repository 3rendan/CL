import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAccounts, AccountColumns, updateAccount, Account} from '../serverAPI/accounts.js'

import MaintenanceTable from '../maintenance/AssetsBenchmarksOwners'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const AccountTable = (props) => {
  const [AccountData, setAccountData]  = useState(null);
  const [error, setError] = useState(null);

  const colNames = AccountColumns.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    return {title: colName, field: fieldName, responsive: 0,
          minWidth: colName === 'Notes' ? 600 : colName === 'Institution' ? 225 : colName === 'Name' ? 175 : colName === 'Account Number' ? 175 : 0,
           editor:"input", cellEdited:function(cell) {
             const newData = cell.getData();
             const newAccount = new Account(newData)
             updateAccount(newAccount).then(a => {
               if (a === 'duplicate key') {
                 const electron = window.require('electron');
                 const dialog = electron.remote.dialog
                 let options  = {
                  buttons: ["Ok"],
                  message: 'Names and Long Names are unique!'
                 }
                 const confirmed = dialog.showMessageBoxSync(options)
                 // const confirmed = window.confirm('Confirm Restore?')
                 cell.restoreOldValue();
               }
             });
           }
        };
  });

  useEffect(() => {
    async function fetchData() {
      const result = await getAccounts();
      if (result === 'failed login') {
        const dialog = electron.remote.dialog
        let options  = {
         buttons: ["Ok"],
         message: 'Login Failed!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        ipcRenderer.send('viewLogin', {});
        return;
      }
      if (!result) {
        throw 'Server Disconnected: null acounts'
      }
      setAccountData(result);
    }
    fetchData().catch(e => setError(e))

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (AccountData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Accounts"} data={AccountData}
                    colNames={colNames} columns={AccountColumns}/>);
};

export default AccountTable;
