import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import MaintenanceTable from './reportTables'

function myDateSort(a, b) {
  let aDate = a.date ? a.date : a.date_due;
  let bDate = b.date ? b.date : b.date_due;


  let firstDay = null;
  if (aDate === undefined) {
    firstDay = "";
  }
  firstDay = moment.utc(aDate).format('LL').toString()
  if (firstDay === 'Invalid date') {
    firstDay = "";
  }

  let secondDay = null;
  if (bDate === undefined) {
    secondDay = "";
  }
  secondDay = moment.utc(bDate).format('LL').toString()
  if (secondDay === 'Invalid date') {
    secondDay = "";
  }

  if (aDate < bDate) {
    return -1;
  }
  else if (aDate > bDate) {
    return 1;
  }
  else {
    if (a.type === 'NAV') {
      return 1;
    }
    else if (b.type === 'NAV') {
      return -1;
    }
    return 0;
  }
}

function calcNAV(group, investmentID, nav) {
  if (group === undefined) {
    return nav;
  }
  group.sort(myDateSort);
  return group.reduce((accumulator, current) => {
    if (current.type === 'TRANSFER') {
      if (current.investment === investmentID) {
        return accumulator + current.amount;
      }
      return accumulator - current.amount;
    }
    if (current.type === 'COMMISH') {
      return accumulator;
    }
    if (current.type === 'NAV') {
      return current.amount;
    }
    let amount = current.amount ? current.amount : current.net_amount;
    return accumulator + amount;
  }, nav);
}

function groupBy(array, item) {
  const result = array.reduce(
    function (r, a) {
        r[a[item]] = r[a[item]] || [];
        r[a[item]].push(a);
        return r;
    }, Object.create(null));
  return result;
}

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
