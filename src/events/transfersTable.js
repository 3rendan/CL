import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getTransfers, TransferColumns} from '../serverAPI/transfers.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;


const TransferTable = (props) => {
  const [TransferData, setTransferData] = useState(null);
  console.log(props)
  const investmentName = props.investmentName;

  ipcRenderer.on('replyTransfer', (event, message) => {
    let copyTableData = [...TransferData, message]
    setTransferData(copyTableData);
  });


  useEffect(() => {
    async function fetchData() {
      let result = [];
      try {
        result = await getTransfers(investmentName);
      }
      catch(err) {
        console.log('ERROR!')
      }

      console.log(result)
      setTransferData(result);
    }
    fetchData();

  }, []);

  if (TransferData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Transfer"}
            data={TransferData} columns={TransferColumns}/>);
};

export default TransferTable;
