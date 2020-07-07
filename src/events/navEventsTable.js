import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, getNAVEvents, NAVColumns} from '../serverAPI/singleEntry.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const NAVEventTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const investmentName = props.investment;

  ipcRenderer.on('replyEvent', (event, message) => {
    let copyTableData = [...NAVEventData, message]
    setNAVEventData(copyTableData);
  });


  useEffect(() => {
    async function fetchData() {
      console.log(investmentName)
      const result = await getNAVEvents(investmentName);
      setNAVEventData(result);
    }
    fetchData();

  }, []);

  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"NAVEvent"} data={NAVEventData} columns={NAVColumns}/>);
};

export default NAVEventTable;
