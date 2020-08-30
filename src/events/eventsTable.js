import React, {Fragment, useState, useEffect, lazy} from "react";
import ReactDOM from 'react-dom';

import {getInvestment} from '../serverAPI/investments.js'

const EventsSingleTable = lazy(() => import("./eventsSingleTable"));
const EventsCommitmentTable = lazy(() => import("./eventsCommitmentTable"));

const frozenColumns = ['Type', 'Date Due'];

const electron = window.require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

const EventTable = (props) => {
  const [investType, setInvestType] = useState(null);
  const [commitment, setCommitment] = useState(null);
  const [investmentName, setInvestmentName] = useState(null);
  const [linkedInvestmentID, setLinkedInvestmentID] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getInvestment(props.investmentID);
      setInvestmentName(result.name)
      setInvestType(result.invest_type)
      setCommitment(result.commitment)
      setLinkedInvestmentID(result.linked_investment)
    }

    fetchData().catch(e =>
      setError(e)
    )


  }, [props.investmentID]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (investmentName === null) {
    return null;
  }
  else if (investType === 'commit') {
    let currWindow = BrowserWindow.getFocusedWindow();
    currWindow.setTitle("Invest Tracker + (" + investmentName + ")")
    return <Fragment> <h1> Investment = {investmentName} </h1>
                <EventsCommitmentTable investment={investmentName}
                  investmentID = {props.investmentID}
                  linkedInvestmentID = {linkedInvestmentID}
                  frozenColumns = {frozenColumns}
                  commitment = {commitment}/>
            </Fragment>
  }
  else {
    let currWindow = BrowserWindow.getFocusedWindow();
    currWindow.setTitle("Invest Tracker + (" + investmentName + ")")
    return <Fragment> <h1> Investment = {investmentName} </h1>
                <EventsSingleTable investment={investmentName}
                  investmentID = {props.investmentID}
                  linkedInvestmentID = {linkedInvestmentID}
                  frozenColumns = {frozenColumns}/>
            </Fragment>
  }
};

export default EventTable;
