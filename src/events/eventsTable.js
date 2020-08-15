import React, {Fragment, useState, useEffect, lazy} from "react";
import ReactDOM from 'react-dom';

import {getInvestment} from '../serverAPI/investments.js'

const EventsSingleTable = lazy(() => import("./eventsSingleTable"));
const EventsCommitmentTable = lazy(() => import("./eventsCommitmentTable"));

const frozenColumns = ['Type', 'Date Due'];

const EventTable = (props) => {
  const [hasCommitment, setHasCommitment] = useState(null);
  const [commitment, setCommitment] = useState(null);
  const [investmentName, setInvestmentName] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getInvestment(props.investmentID);
      setInvestmentName(result.name)
      setHasCommitment(result.has_commitment)
      setCommitment(result.commitment)
    }

    fetchData().catch(e =>
      setError(e)
    )


  }, [props.investmentID]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (hasCommitment === null) {
    return null;
  }
  else if (hasCommitment) {
    return <Fragment> <h1> Investment = {investmentName} </h1>
                <EventsCommitmentTable investment={investmentName}
                  investmentID = {props.investmentID}
                  frozenColumns = {frozenColumns}
                  commitment = {commitment}/>
            </Fragment>
  }
  else {
    return <Fragment> <h1> Investment = {investmentName} </h1>
                <EventsSingleTable investment={investmentName}
                  investmentID = {props.investmentID}
                  frozenColumns = {frozenColumns}/>
            </Fragment>
  }
};

export default EventTable;
