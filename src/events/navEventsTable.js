import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, getNAVEvents, NAVColumns} from '../serverAPI/singleEntry.js'

import MaintenanceTable from './allTables'

const NAVEventTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const [key, setKey] = useState(0);
  const [error, setError] = useState(null);

  const investmentID = props.investmentID;

  useEffect(() => {
    async function fetchData() {
      const result = await getNAVEvents(investmentID);
      setNAVEventData(result);
    }

    fetchData().catch(e =>
      setError(e)
    )


  }, [key]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable
            name={"NAV Entries"} data={NAVEventData}
            columns={NAVColumns} investmentID={investmentID}/>);
};

export default NAVEventTable;
