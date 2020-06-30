import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {ViewInvestmentTable} from '../maintenance/AccountInvestment'
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
  return (<ViewInvestmentTable data={InvestmentData}
    name={'Investment Data'}
   columns={InvestmentColumns}/>);
}

export default ViewOnlyInvestmentTable;
