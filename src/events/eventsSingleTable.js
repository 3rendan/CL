import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, SingleEntryColumns} from '../serverAPI/singleEntry.js'


import {getDistributionsInvestment, DistributionColumns} from '../serverAPI/distributions.js'
import {getContributionsInvestment, ContributionColumns} from '../serverAPI/contributions.js'
import {getCommissionsInvestment, CommissionColumns} from '../serverAPI/commissions.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;


const EventTable = (props) => {
  const [EventData, setEventData] = useState(null);
  const investmentName = props.investment;
  const investmentID = props.investmentID;

  ipcRenderer.on('replyEvent', (event, message) => {
    let copyTableData = [message]
    if (EventData !== null) {
      copyTableData = [...EventData, message]
    }
    setEventData(copyTableData);
  });


  useEffect(() => {
    async function fetchData() {
      let singleEntry = await getSingleEntrys(investmentID);
      singleEntry = singleEntry ? singleEntry : [];
      let commission = await getCommissionsInvestment(investmentID);
      commission = commission ? commission : [];
      let distribution = await getDistributionsInvestment(investmentID);
      distribution = distribution ? distribution : [];
      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      console.log(commission)
      setEventData([...singleEntry, ...commission, ...distribution, ...contribution]);
    }
    fetchData();

  }, []);

  if (EventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Event"} data={EventData}
            columns={SingleEntryColumns} hasCommitment={false}
            investmentID={investmentID}/>);
};

export default EventTable;
