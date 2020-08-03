import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import DetailInvestmentTable from '../maintenance/AccountInvestment'
import {getInvestments, InvestmentColumns} from '../serverAPI/investments.js'

const electron = window.require('electron');
const remote = electron.remote;
const ipcRenderer  = electron.ipcRenderer;

const ViewOnlyInvestmentTable = () => {
  const [InvestmentData, setInvestmentData]  = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(remote.getGlobal('database'));
    async function fetchData() {
      const investments = await getInvestments();
      if (!investments) {
        throw 'Server Disconnected: null investments'
      }
      setInvestmentData(investments);
    }
    fetchData().catch(e => setError(e))
  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (InvestmentData === null) {
    return null;
  }
  return (<DetailInvestmentTable data={InvestmentData}
    name={'Investment Data'}
   columns={InvestmentColumns} readOnly={true}/>);
}

export default ViewOnlyInvestmentTable;
