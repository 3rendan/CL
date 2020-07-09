import React, {useState, useEffect, lazy} from "react";
import ReactDOM from 'react-dom';

import {getInvestment} from '../serverAPI/investments.js'

const EventsSingleTable = lazy(() => import("./eventsSingleTable"));
const EventsCommitmentTable = lazy(() => import("./eventsCommitmentTable"));


const EventTable = (props) => {
  const [hasCommitment, setHasCommitment] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log(props.investmentID)
      const result = await getInvestment(props.investmentID);
      console.log(result)
      setHasCommitment(result.has_commitment)
    }
    fetchData();

  }, []);

  if (hasCommitment === null) {
    return null;
  }
  else if (hasCommitment) {
    return <EventsCommitmentTable investment={props.investment}
                  investmentID = {props.investmentID}/>
  }
  else {
    return <EventsSingleTable investment={props.investment}
                  investmentID = {props.investmentID}/>
  }
};

export default EventTable;
