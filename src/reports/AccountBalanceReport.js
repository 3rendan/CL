import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {calcNAV} from '../SpecialColumn'

import MaintenanceTable from './reportTables'


const AccountBalanceReport = (props) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData(investmentID) {
      let singleEntry = await getSingleEntrys(investmentID);
      singleEntry = singleEntry ? singleEntry : [];
      let commission = await getCommissionsInvestment(investmentID);
      commission = commission ? commission : [];
      commission = commission.map((comm) => {
        comm['type'] = 'COMMISH'
        return comm;
      })
      let distribution = await getDistributionsInvestment(investmentID);
      distribution = distribution ? distribution : [];
      distribution = distribution.map((dist) => {
        dist['type'] = 'DISTRIBUTION'
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        return contr;
      })

      let navs = await getNAVEvents(investmentID);
      navs = navs.map((nav) => {
        nav['type'] = 'NAV'
        return nav;
      })

      let transfers = await getTransfers(investmentID);
      transfers = transfers.map((transfer) => {
        transfer['type'] = 'TRANSFER'
        return transfer;
      })

      return [...singleEntry, ...commission,
        ...distribution, ...contribution, ...navs,
        ...transfers];
    }

    async function manipulateData() {
      const investments = await getInvestments();
      const accounts = {}
      console.log(accounts)
      await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);
        console.log(investment)
        console.log(data)
        const nav = calcNAV(data, investment.id, 0);
        console.log(nav)
        if (investment.account in accounts) {
          accounts[investment.account] += nav;
        }
        else {
          accounts[investment.account] = nav;
        }
      }));
      console.log(accounts)
      const allAccounts = Object.keys(accounts);
      console.log(allAccounts)
      const accountData = allAccounts.map((account) => {
        return {account: account, nav: accounts[account]}
      })
      console.log(accountData)
      setData(accountData);
    }
    manipulateData();

  }, []);
  if (data === null) {
    return <div> hi </div>;
  }
  return (<MaintenanceTable name={"Account NAV"} data={data}
            columns={['Account', 'NAV']}
            moneyColumns={['NAV']}
            noButton={true}/>);
}

export default AccountBalanceReport;
