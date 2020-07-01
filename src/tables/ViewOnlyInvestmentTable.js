import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import DetailInvestmentTable from '../maintenance/AccountInvestment'
import {getInvestments, InvestmentColumns} from '../serverAPI/investments.js'

const ViewOnlyInvestmentTable = () => {
  const [InvestmentData, setInvestmentData]  = useState(null);

  useEffect(() => {
    async function fetchData() {
      const investments = await getInvestments();
      setInvestmentData(investments);
    }
    fetchData();
  }, []);

  if (InvestmentData === null) {
    return null;
  }
  return (<DetailInvestmentTable data={InvestmentData}
    name={'Investment Data'}
   columns={InvestmentColumns} readOnly={true}/>);
}

export default ViewOnlyInvestmentTable;
