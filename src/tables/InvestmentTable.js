import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import DetailInvestmentTable from '../maintenance/AccountInvestment'

import {getAccounts, AccountColumns} from '../serverAPI/accounts.js'
import {getAssetClasses, AssetClassColumns} from '../serverAPI/assetClass.js'
import {getBenchmarks, BenchmarkColumns} from '../serverAPI/benchmarks.js'
import {getInvestments, InvestmentColumns} from '../serverAPI/investments.js'
import {getOwners, OwnerColumns} from '../serverAPI/owners.js'

const InvestmentTable = () => {
  const [AccountData, setAccountData]  = useState(null);
  const [AssetClassData, setAssetClassData]  = useState(null);
  const [BenchmarkData, setBenchmarkData]  = useState(null);
  const [InvestmentData, setInvestmentData]  = useState(null);
  const [OwnerData, setOwnerData]  = useState(null);


  useEffect(() => {
    async function fetchData() {
      const accounts = await getAccounts();
      setAccountData(accounts);

      const assetClass = await getAssetClasses();
      setAssetClassData(assetClass);

      const benchmarks = await getBenchmarks();
      setBenchmarkData(benchmarks);

      const investments = await getInvestments();
      setInvestmentData(investments);

      const owners = await getOwners();
      setOwnerData(owners);
    }
    fetchData();
  }, []);


  if (InvestmentData === null) {
    return null;
  }
  return (<DetailInvestmentTable     data={InvestmentData}
      AssetClassData={AssetClassData}  OwnerData={OwnerData}
      BenchmarkData={BenchmarkData} AccountData={AccountData}
    name={'Investment Data'} columns={InvestmentColumns}
    readOnly={false} />);
}

export default InvestmentTable;
