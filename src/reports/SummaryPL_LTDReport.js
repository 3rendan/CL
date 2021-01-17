import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {stringDateConvertLocalTimezone} from '../timezoneOffset';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {calcNAV, calcNetContribute} from '../SpecialColumn'

import MaintenanceTable from './reportTables'

function groupByMonth(array, invest_type) {
  const result = array.reduce(function (r, a) {
    let element = a.date;
    if (invest_type === 'cash') {
      element = a.date_sent;
      if (element === undefined) {
        element = a.date
      }
      element = moment(element);
    }
    else {
      if (element === undefined) {
        element = a.date_due
      }
      element = moment(element);
    }
    const endMonth = new Date(element.year(), (element.month() + 1), 0);
    if (!isNaN(endMonth)) {
      r[endMonth] = r[endMonth] || [];
      r[endMonth].push(a);
    }
    else {
      console.log('this is the element that broke it')
      console.log('element')
      console.log(element)
      console.log(invest_type)
      console.log('a')
      console.log(a)
      console.log('a.date ' + a.date);
      console.log('a.date_sent ' + a.date_sent);
      console.log('a.date_due ' + a.date_due);
      console.log('end element that brooke it')
    }
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
        dist['date_sent'] = dist['contra_date'];
        dist['to_investment'] = dist.contra_investment;
        dist['from_investment'] = dist.fund_investment;
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        contr['date_sent'] = contr['contra_date'];
        contr['to_investment'] = contr.contra_investment;
        contr['from_investment'] = contr.fund_investment;
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
      console.log('NAMES!');
      console.log(investments.map(investment => investment.name));
      const allDates = [];

      const investmentsToData = await Promise.all(
        investments.map(async (investment) => {
          const data     = await fetchData(investment.id);
          const navData  = await getNAVEvents(investment.id);
          const groups   = groupByMonth(data, investment.invest_type);
          return {
            investment: investment,
            data: data,
            navData: navData,
            groups: groups,
          };
        })
      );

      investmentsToData.sort(function (a, b) {
        const investmentA = a.investment;
        const investmentB = b.investment;

        return investmentA.seq_no - investmentB.seq_no;
      });

      let finalMonth = new Date(currEndMonth);
      investmentsToData.map((allData) => {
        const groups = allData.groups;

        let tempFinalMonth = new Date(Math.max(...Object.keys(groups).map(date => new Date(date))));
        if (!isNaN(tempFinalMonth)) {
            finalMonth = new Date(Math.max(tempFinalMonth, finalMonth));
        }
        else {
          console.log('this is what is broken ');
          console.log(tempFinalMonth)
          console.log(Math.max(...Object.keys(groups).map(date => new Date(date))))
        }
      });
      console.log('final final month');
      console.log(finalMonth);

      const investmentData = investmentsToData.map((allData) => {
        const investment = allData.investment;
        const data = allData.data;
        const navData = allData.navData;
        const groups = allData.groups;

        let minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));
        console.log(investment.name + '   minDate')
        console.log(minDate);

        let nav = 0;
        const investmentRow = {investment: investment.name}
        let netContribute = 0;

        while (minDate <= finalMonth) {
          nav = calcNAV(groups[minDate], investment.id, nav, investment.invest_type);
          netContribute = calcNetContribute(groups[minDate], investment.id, netContribute);
          const formatDate = moment(minDate).format('L')
          // console.log('date in loop: ' + formatDate);
          const fieldName = formatDate.toLowerCase().replace(new RegExp(' ', 'g'), '_');
          investmentRow[fieldName] = nav - netContribute;

          if (!allDates.includes(formatDate)) {
            allDates.push(formatDate)
          }
          // get next end of month
          minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        }
        return investmentRow;
      });

      // sumPLs
      const sumPLs = {investment: 'Total P/L'}
      allDates.map(date => {
        investmentData.map(investment => {
          if (date in sumPLs) {
            sumPLs[date] += investment[date] === undefined ? 0 : investment[date]
          }
          else {
            sumPLs[date] = investment[date] === undefined ? 0 : investment[date]
          }
        })
      })

      investmentData.push({investment: ' '})
      investmentData.push(sumPLs)

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
      console.log('ALL DATES');
      console.log(allDates);

      setMoneyColumns(allDates);
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
  return (<MaintenanceTable name={"Summary P/L (LTD) Report"} data={data}
            columns={columns} frozenColumns={frozenColumns}
            moneyColumns={moneyColumns}
            scrollTo={columns[columns.length - 1]}/>);
}

export default SummaryReport;
