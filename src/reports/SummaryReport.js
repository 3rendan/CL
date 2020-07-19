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

const SummaryReport = (props) => {
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [moneyColumns, setMoneyColumns] = useState(null);

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
      const today = new Date();
      const currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const investments = await getInvestments();

      const allDates = [];
      const investmentData = await Promise.all(
        investments.map(async (investment) => {
          const data = await fetchData(investment.id);
          const groups = groupByMonth(data);

          var minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));

          let nav = 0;
          const investmentRow = {name: investment.name}

          while (minDate <= currEndMonth) {
            nav = calcNAV(groups[minDate], investment.id, nav);
            const formatDate = moment(minDate).format('LL')
            const fieldName = formatDate.toLowerCase().replace(new RegExp(' ', 'g'), '_');
            investmentRow[fieldName] = nav;
            if (!allDates.includes(formatDate)) {
              allDates.push(formatDate)
            }
            // get next end of month
            minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
          }
          return investmentRow;
        })
      )

      setMoneyColumns(allDates);
      setColumns(['name', ...allDates]);
      setData(investmentData)
    }

    manipulateData();

  }, []);

  if (data === null) {
    return <div> hi </div>;
  }
  return (<div>
    <MaintenanceTable name={"Summary Report"} data={data}
            columns={columns}
            moneyColumns={moneyColumns}/>
        </div>
            );
}

export default SummaryReport;
