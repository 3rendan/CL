import React, {Fragment, useState, useEffect} from "react";
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
  const [error, setError] = useState(null);


  useEffect(() => {
    async function fetchData() {
      const owners = await getOwners();
      if (!owners) {
        throw 'Server Disconnected: null owners'
      }
      setOwnerData(owners);

      const accounts = await getAccounts();
      if (!accounts) {
        throw 'Server Disconnected: null accounts'
      }
      setAccountData(accounts);

      const assetClass = await getAssetClasses();
      if (!assetClass) {
        throw 'Server Disconnected: null assetClass'
      }
      setAssetClassData(assetClass);

      const benchmarks = await getBenchmarks();
      if (!benchmarks) {
        throw 'Server Disconnected: null benchmarks'
      }
      setBenchmarkData(benchmarks);

      const investments = await getInvestments();
      if (investments === false) {
        throw 'Failed to Authenticate'
      }
      if (!investments) {
        throw 'Server Disconnected: null investments'
      }
      setInvestmentData(investments);
    }
    fetchData().catch(e => setError(e))
  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (InvestmentData === null) {
    return null;
  }
  return (<DetailInvestmentTable     data={InvestmentData}
      AssetClassData={AssetClassData}  OwnerData={OwnerData}
      BenchmarkData={BenchmarkData} AccountData={AccountData}
    name={'Investment'} columns={InvestmentColumns}
    readOnly={false} />);
}

export default InvestmentTable;
