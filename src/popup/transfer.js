import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const FormSheet = lazy(() => import('./popup'));

const Transfer = () => {
  return (
    <FormSheet getInvestmentData={getInvestments} transcationType={'TRANSFER'} dropdownOptions={['TRANSFER']} />
  )
}

export default Transfer;
