import React, {useState, useEffect, lazy} from "react";
import ReactDOM from 'react-dom';

import {getInvestment} from '../serverAPI/investments.js'

const EventsSingleTable = lazy(() => import("./eventsSingleTable"));
const EventsCommitmentTable = lazy(() => import("./eventsCommitmentTable"));

const moneyColumns = ['Net Amount', 'Main',
'Recallable',	'Withhold',
'Fees', 'Tax', 'Outside Main', 'Outside Fees', 'Outside Tax']

const eventColumns = ['Type', 'Date Due', 'Date Sent',
    'Investment', 'From Investment',
    ...moneyColumns,
    'Notes']

const EventTable = (props) => {
  const [hasCommitment, setHasCommitment] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getInvestment(props.investmentID);
      setHasCommitment(result.has_commitment)
    }
    fetchData();

  }, []);

  if (hasCommitment === null) {
    return null;
  }
  else if (hasCommitment) {
    return <EventsCommitmentTable investment={props.investment}
                  investmentID = {props.investmentID}
                  columns = {eventColumns}
                  moneyColumns = {moneyColumns}/>
  }
  else {
    return <EventsSingleTable investment={props.investment}
                  investmentID = {props.investmentID}
                  columns = {eventColumns}
                  moneyColumns = {moneyColumns}/>
  }
};

export default EventTable;
