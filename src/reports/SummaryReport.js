import React, {Fragment, useState, useEffect} from "react";
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
  const [error, setError] = useState(null);
  const frozenColumns = ['Investment'];
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

    async function getNetExpenses(groups) {
      const expenses = {}
      Object.keys(groups).map(month => {
        expenses[month] = groups[month].reduce(function (a,b) {
          if (b.type === 'EXPENSE') {
            return a + b.amount;
          }
          else if (b.type === 'CREDIT') {
            return a - b.amount;
          }
          return a;
        }, 0)
      })
      return expenses;
    }

    async function getTotalInflow(groups) {
      const inflows = {}
      Object.keys(groups).map(month => {
        inflows[month] = groups[month].reduce(function (a,b) {
          if (b.type === 'INFLOW') {
            return a + b.amount;
          }
          return a;
        }, 0)
      })
      return inflows;
    }

    async function getTotalOutflow(groups) {
      const outflow = {}
      Object.keys(groups).map(month => {
        // console.log(month)
        // console.log(groups[month])
        outflow[month] = groups[month].reduce(function (a,b) {
          if (b.type === 'OUTFLOW') {
            return a + b.amount;
          }
          return a;
        }, 0)
      })
      // console.log(outflow)
      return outflow;
    }

    async function manipulateData() {
      const today = new Date();
      const currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const investments = await getInvestments();

      const allDates = [];
      const netExpensesByDate = {investment: 'Net Expenses'}
      const inflowsByDate = {investment: 'Total Inflows'}
      const outflowsByDate = {investment: 'Total Outflows'}

      const investmentData = await Promise.all(
        investments.map(async (investment) => {
          const data     = await fetchData(investment.id);
          const navData  = await getNAVEvents(investment.id);
          const groups = groupByMonth(data);

          let netExpenses = await getNetExpenses(groups);
          let inflows     = await getTotalInflow(groups);
          let outflows    = await getTotalOutflow(groups);


          Object.keys(netExpenses).map(date => {
            const dateFormat = moment(new Date(date)).format('L')
            if (date in netExpensesByDate) {
              netExpensesByDate[dateFormat] += netExpenses[date] === undefined ? 0 : netExpenses[date]
            }
            else {
              netExpensesByDate[dateFormat] = netExpenses[date] === undefined ? 0 : netExpenses[date]
            }
          })

          Object.keys(inflows).map(date => {
            const dateFormat = moment(new Date(date)).format('L')
            if (dateFormat in inflowsByDate) {
              inflowsByDate[dateFormat] += inflows[date] === undefined ? 0 : inflows[date]
            }
            else {
              inflowsByDate[dateFormat] = inflows[date] === undefined ? 0 : inflows[date]
            }
          })

          Object.keys(outflows).map(date => {
            const dateFormat = moment(new Date(date)).format('L')
            if (dateFormat in outflowsByDate) {
              outflowsByDate[dateFormat] += outflows[date] === undefined ? 0 : outflows[date]
            }
            else {
              outflowsByDate[dateFormat] = outflows[date] === undefined ? 0 : outflows[date]
            }
          })

          var minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));
          const today = new Date();
          let currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          let finalMonth = new Date(Math.max(...Object.keys(groups).map(date => new Date(date))));
          finalMonth = new Date(Math.max(currEndMonth, finalMonth));

          let nav = 0;
          const investmentRow = {investment: investment.name}

          while (minDate <= finalMonth) {
            nav = calcNAV(groups[minDate], investment.id, nav);
            const formatDate = moment(minDate).format('L')
            const fieldName = formatDate.toLowerCase().replace(new RegExp(' ', 'g'), '_');
            investmentRow[fieldName] = nav;

            investmentRow[fieldName +'Bold'] = 'normal';
            if (navData.filter(i => moment(new Date(i.date)).format('L') === formatDate).length > 0) {
              investmentRow[fieldName +'Bold'] = 'bold';
            }

            if (!allDates.includes(formatDate)) {
              allDates.push(formatDate)
            }
            // get next end of month
            minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
          }
          return investmentRow;
        })
      )

      // sumNAVs
      const sumNAVs = {investment: 'Total NAV'}
      allDates.map(date => {
        if (!(date in netExpensesByDate)) {
          netExpensesByDate[date] = 0;
        }
        if (!(date in inflowsByDate)) {
          inflowsByDate[date] = 0;
        }
        if (!(date in outflowsByDate)) {
          outflowsByDate[date] = 0;
        }

        investmentData.map(investment => {
          if (date in sumNAVs) {
            sumNAVs[date] += investment[date] === undefined ? 0 : investment[date]
          }
          else {
            sumNAVs[date] = investment[date] === undefined ? 0 : investment[date]
          }
        })
      })

      investmentData.push({investment: ' '})
      investmentData.push(sumNAVs)

      // sort dates
      allDates.sort(function(a,b) {
        const aDate = new Date(a)
        const bDate = new Date(b)
        if (aDate < bDate) {
          return -1;
        }
        else if (aDate > bDate) {
          return 1;
        }
        return 0;
      })

      const gainsByDate = {investment: 'Gain ($)'}
      const gainPercentByDate = {investment: 'Gain (%)'}
      const gainPercentDisplayByDate = {investment: 'Gain (%)'}

      const gains12ByDate = {investment: 'T12M Gain ($)', months: 12}
      const gains12PercentByDate = {investment: 'T12M Gain (%)'}
      const gains36ByDate = {investment: 'T36M Gain ($)', months: 36}
      const gains36PercentByDate = {investment: 'T36M Gain (%)'}
      allDates.map((currDate, i) => {
        if (i !== 0) {
          const prevDate = allDates[i-1];
          gainsByDate[currDate] = sumNAVs[currDate] - sumNAVs[prevDate] - inflowsByDate[currDate] + outflowsByDate[currDate] + netExpensesByDate[currDate];
          gainPercentByDate[currDate] = (gainsByDate[currDate] / sumNAVs[prevDate] * 100)
          gainPercentDisplayByDate[currDate] = gainPercentByDate[currDate].toFixed(2) + '%'
        }

        if (i >= gains12ByDate.months) {
          const dateRange = allDates.slice(i - (gains12ByDate.months - 1), i+1)
          gains12ByDate[currDate] = dateRange.reduce(function (acc, date) {
            return acc + gainsByDate[date];
          }, 0);

          const percent = dateRange.reduce(function (acc, date) {
            return acc * (1 + gainPercentByDate[date]/100);
          }, 1) - 1;
          gains12PercentByDate[currDate] = (percent * 100).toFixed(2) + '%'
        }
        if (i >= gains36ByDate.months) {
          const dateRange = allDates.slice(i - (gains36ByDate.months - 1), i + 1)
          gains36ByDate[currDate] = dateRange.reduce(function (acc, date) {
            return acc + gainsByDate[date];
          }, 0);

          const percent = dateRange.reduce(function (acc, date) {
            return acc * (1 + gainPercentByDate[date]/100);
          }, 1) - 1;
          gains36PercentByDate[currDate] = (percent * 100).toFixed(2) + '%'
        }
      })

      investmentData.push(gainsByDate)
      investmentData.push(gainPercentDisplayByDate)

      investmentData.push(gains12ByDate)
      investmentData.push(gains12PercentByDate)
      investmentData.push(gains36ByDate)
      investmentData.push(gains36PercentByDate)

      investmentData.push(netExpensesByDate)
      investmentData.push(inflowsByDate)
      investmentData.push(outflowsByDate)
      setMoneyColumns(allDates);
      // console.log(allDates)
      setColumns(['Investment', ...allDates]);
      setData(investmentData)
    }

    manipulateData().catch(e => setError(e))

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <div> </div>;
  }
  return (<MaintenanceTable name={"Summary Report"} data={data}
            columns={columns} frozenColumns={frozenColumns}
            moneyColumns={moneyColumns}
            scrollTo={columns[columns.length - 1]}/>);
}

export default SummaryReport;
