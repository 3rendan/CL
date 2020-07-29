import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const FormSheet = lazy(() => import('./popup'));

const Event = (props) => {
  return (
    <FormSheet getInvestmentData={getInvestments}
    dropdownOptions={['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH']}
    investmentID={props.match.params.id}/>
  )
}

export default Event;
