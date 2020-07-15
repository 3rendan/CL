import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const FormSheet = lazy(() => import('./popup'));

const EventCommitment = (props) => {
  return (
    <FormSheet getInvestmentData={getInvestments}
    dropdownOptions={['INFLOW', 'OUTFLOW', 'DIV', 'GAIN', 'COMMISH', 'DISTRIBUTION', 'CONTRIBUTION']}
    investmentID={props.match.params.id} />
  )
}

export default EventCommitment;
