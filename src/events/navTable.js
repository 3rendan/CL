import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'

import MaintenanceTable from './allTables'

import moment from 'moment';

const navColumns = ['Date', 'NAV', 'NET CONTRIB', 'P/L'];

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

function groupByMonth(array) {
  const result = array.reduce(function (r, a) {
    let element = a.date;
    if (element === undefined) {
      element = a.date_due
    }
    element = moment(element);
    const endMonth = new Date(element.year(), (element.month() + 1), 0);
    r[endMonth] = r[endMonth] || [];
    r[endMonth].push(a);
    return r;
  }, Object.create(null));
  return result;
}

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

function calcNetContribute(group, investmentID, nav) {
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
    // NAV and COMMISH have no effect
    if (current.type === 'COMMISH' || current.type === 'NAV') {
      return accumulator;
    }
    let amount = current.amount ? current.amount : current.net_amount;
    return accumulator + amount;
  }, nav);
}

const NAVTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const investmentName = props.investment;
  const investmentID = props.investmentID;
  const NAVColumns = ['Date', 'NAV', 'Net Contribute', 'P/L']
  const moneyColumns = ['NAV', 'Net Contribute', 'P/L'];

  useEffect(() => {
    async function fetchData() {
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
      const myData = await fetchData();
      const groups = groupByMonth(myData);

      var minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));

      const today = new Date();
      const currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      let nav = 0;
      let netContribute = 0;
      const navDates = [];
      const monthNav = {}
      const monthNetContribute = {};
      const monthPL = {};
      while (minDate <= currEndMonth) {
        nav = calcNAV(groups[minDate], investmentID, nav);
        netContribute = calcNetContribute(groups[minDate], investmentID, netContribute);
        const formatDate = moment(minDate).format('LL')
        navDates.push({date: formatDate, nav: nav, net_contribute: netContribute, 'p/l': nav - netContribute})


        // get next end of month
        minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
      }


      setNAVEventData(navDates)
    }
    manipulateData();

  }, []);


  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"NAV"} data={NAVEventData}
            columns={NAVColumns} investmentID={investmentID}
            moneyColumns={moneyColumns}/>);
};

export default NAVTable;
