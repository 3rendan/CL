import React, {Fragment, useState, useEffect, useCallback} from "react";
import ReactDOM from 'react-dom';
import DetailInvestmentTable from '../maintenance/AccountInvestment'

import {getAccounts, AccountColumns} from '../serverAPI/accounts.js'
import {getAssetClasses, AssetClassColumns} from '../serverAPI/assetClass.js'
import {getBenchmarks, BenchmarkColumns} from '../serverAPI/benchmarks.js'
import {getInvestments, InvestmentColumns} from '../serverAPI/investments.js'
import {getOwners, OwnerColumns} from '../serverAPI/owners.js'

const getMemoizedNames = (list, id) => {
  if (id === undefined || list === undefined) {
    return null;
  }
  const filtered = list.filter(i => i.id === id);
  if (filtered.length === 0) {
    return null;
  }
  return filtered[0].name
}

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const InvestmentTable = (props) => {
  const [AccountData, setAccountData]  = useState(null);
  const [AssetClassData, setAssetClassData]  = useState(null);
  const [BenchmarkData, setBenchmarkData]  = useState(null);
  const [InvestmentData, setInvestmentData]  = useState(null);
  const [OwnerData, setOwnerData]  = useState(null);
  const [error, setError] = useState(null);

  const getAccountName = useCallback((list, id) => getMemoizedNames(list, id), [])
  const getAssetClassName = useCallback((list, id) => getMemoizedNames(list, id), [])
  const getBenchmarkName = useCallback((list, id) => getMemoizedNames(list, id), [])
  const getInvestmentName = useCallback((list, id) => getMemoizedNames(list, id), [])
  const getOwnerName = useCallback((list, id) => getMemoizedNames(list, id), [])

  useEffect(() => {
    async function fetchData() {
      const owners = await getOwners();
      if (owners === 'failed login') {
        const dialog = electron.remote.dialog
        let options  = {
         buttons: ["Ok"],
         message: 'Login Failed!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        ipcRenderer.send('viewLogin', {});
        return;
      }
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

      // map across in this order so that it's memoized better
      investments.map(investment => {
        investment.primary_benchmark = getBenchmarkName(benchmarks, investment.primary_benchmark)
        investment.secondary_benchmark = getBenchmarkName(benchmarks, investment.secondary_benchmark)

        // accounts
        investment.account = getAccountName(accounts, investment.account)

        investment.asset_class = getAssetClassName(assetClass, investment.asset_class)
        investment.sub_asset_class = getAssetClassName(assetClass, investment.sub_asset_class)

        investment.owner = getOwnerName(owners, investment.owner)

        investment.linked_investment = getInvestmentName(investments, investment.linked_investment)
      })

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
    name={'Investments'} columns={InvestmentColumns}
    readOnly={props.readOnly} />);
}

export default InvestmentTable;
