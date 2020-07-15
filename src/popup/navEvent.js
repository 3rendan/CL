import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const FormSheet = lazy(() => import('./popup'));

const NAVEvent = (props) => {
  return (
    <FormSheet getInvestmentData={getInvestments}
          transcationType={'NAV'}
           dropdownOptions={['NAV']}
           investmentID={props.match.params.id}/>
  )
}

export default NAVEvent;
