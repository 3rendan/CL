import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, SingleEntryColumns} from '../serverAPI/singleEntry.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;


const EventTable = (props) => {
  const [EventData, setEventData] = useState(null);
  const investmentName = props.investment;
  const investmentID = props.investmentID;

  ipcRenderer.on('replyEvent', (event, message) => {
    let copyTableData = [new SingleEntry(message)]
    if (EventData !== null) {
      copyTableData = [...EventData, new SingleEntry(message)]
    }
    setEventData(copyTableData);
  });


  useEffect(() => {
    async function fetchData() {
      const result = await getSingleEntrys(investmentID);
      setEventData(result);
    }
    fetchData();

  }, []);

  if (EventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Event"} data={EventData} columns={SingleEntryColumns}/>);
};

export default EventTable;
