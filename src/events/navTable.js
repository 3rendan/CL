import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'

import {getIrr} from '../serverAPI/irr'

import {calcNAV, calcPrelimNAV, myDateSort} from '../SpecialColumn'

import MaintenanceTable from './allTables'

import moment from 'moment';

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

function calcNetContribute(group, investmentID, nav) {
  if (group === undefined) {
    return nav;
  }
  group.sort(myDateSort);
  return group.reduce((accumulator, current) => {
    if (current.type === 'TRANSFER') {
      if (current.to_investment === investmentID) {
        return accumulator + current.amount;
      }
      return accumulator - current.amount; // in from_investment
    }
    if (current.type === 'NAV' || current.type === 'COMMISH'
        || current.type === 'GAIN' || current.type === 'DIV') {
      return accumulator;
    }
    let amount = current.amount !== undefined ? current.amount : current.net_amount;
    if (current.type === 'DISTRIBUTION' || current.type === 'CONTRIBUTION') {
      // amount is negative for type distribution
      if (current.from_investment === investmentID) {
        return accumulator + amount;
      }
      return accumulator - amount;
    }
    return accumulator + amount;
  }, nav);
}

const NAVTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const [error, setError] = useState(null);


  const investmentID = props.investmentID;
  const NAVColumns = ['Date', 'NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR']
  const moneyColumns = ['NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR'];

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

    async function getIrrEvents(data) {
      const dates = []
      const events = data.map((event) => {
        let date = event.date ? event.date : event.date_due
        date = moment(date).format('YYYY-MM-DD')
        dates.push(date)
        if (event.type === 'TRANSFER') {
          if (event.to_investment === investmentID) {
            return `${date}:${event.amount}`;
          }
          return `${date}:${event.amount}`; // in from_investment
        }
        if (event.type === 'COMMISH') {
          if (investmentID === event.investment) {
            return `${date}:0`;
          }
          return `${date}:${-1 * event.amount}`; // in from_investment
        }
        if (event.type === 'NAV') {
          return '';
        }
        let amount = event.amount !== undefined ? event.amount : event.net_amount;
        if (event.type === 'DISTRIBUTION' || event.type === 'CONTRIBUTION') {
          // amount is negative for type distribution
          if (event.from_investment === investmentID) {
            return `${date}:${amount}`;
          }
          return `${date}:${amount}`;
        }
        return `${date}:${amount}`;
      })
      return [events.join(' '), dates];
    }

    async function calcIrr(navDates, eventString, eventDates) {
      const dateOfNavDates = navDates.map(navDate => new Date(navDate.date))
      const navOfNavDates = navDates.map(navDate => navDate.nav)
      let minDate = new Date(Math.min(...dateOfNavDates))
      let minEventDate = new Date(Math.min(...eventDates.map(date => new Date(date))))
      let startDate = new Date(Math.min(minDate, minEventDate))
      startDate.setDate(startDate.getDate() - 1)

      const startNAV = 0;

      let dates = [startDate, ...dateOfNavDates]
      dates = dates.map(date => {
        const tempDate = new Date(date)
        return moment(tempDate).format('YYYY-MM-DD')
      })
      const navs = [startNAV, ...navOfNavDates]

      return await getIrr({dates: dates, navs: navs, eventString: eventString})

    }

    async function manipulateData() {
      const myData = await fetchData();


      const groups = groupByMonth(myData);

      let minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));

      const today = new Date();
      let currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      let finalMonth = new Date(Math.max(...Object.keys(groups).map(date => new Date(date))));
      finalMonth = new Date(Math.max(currEndMonth, finalMonth));

      let prev_nav = 0;
      let nav = 0;
      let prelim_nav = 0;
      let netContribute = 0;
      const navDates = [];
      let last_pl = null;
      while (minDate <= finalMonth) {
        nav = calcNAV(groups[minDate], investmentID, prev_nav);
        prelim_nav = calcPrelimNAV(groups[minDate], investmentID, prev_nav);
        netContribute = calcNetContribute(groups[minDate], investmentID, netContribute);
        const formatDate = moment(minDate).format('L')


        const hasEndOfMonthNAV = groups[minDate] ? groups[minDate].filter(event => {
          if (event.type === 'NAV') {
            const date = new Date(event.date);
            if (date.getDate() === minDate.getDate()
                && date.getMonth() === minDate.getMonth()
                && date.getFullYear() === minDate.getFullYear()) {
                  return true;
            }
          }
          return false;
        }).length > 0 : false;

        if (last_pl === null) {
          const mtd = nav - netContribute
          navDates.push({date: formatDate, nav: nav, net_contribution: netContribute,
                          nav_prelim: prelim_nav, unexplained_gain: nav - prelim_nav,
                          'p/l_(ltd)': nav - netContribute,
                          'p/l_(mtd)': mtd,
                          bold: hasEndOfMonthNAV})
        }
        else {
          const mtd = (nav - netContribute - last_pl)
          const mtd_perc = (mtd/prev_nav * 100).toFixed(2) + '%'
          navDates.push({date: formatDate, nav: nav, net_contribution: netContribute,
                          nav_prelim: prelim_nav, unexplained_gain: nav - prelim_nav,
                          'p/l_(ltd)': nav - netContribute,
                          'p/l_(mtd)': mtd,
                          'p/l(%)_(mtd)': mtd_perc,
                          bold: hasEndOfMonthNAV})
        }
        last_pl = (nav - netContribute).valueOf()




        // get next end of month
        minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        prev_nav = nav;
      }

      const [myEventString, eventDates] = await getIrrEvents(myData);
      const irrs = await calcIrr(navDates, myEventString, eventDates);
      irrs.map(irr => {
        const [date, irrRate] = irr.split(' ');
        const [year, month, day] = date.split('-');

        const formattedDate = `${month}/${day}/${year}`;
        try {
          const navDate = navDates.filter(navDate => navDate.date === formattedDate)
          navDate[0].irr = parseFloat(irrRate).toFixed(2) + '%'
        }
        catch (e) {
        }
      })
      setNAVEventData(navDates)
    }

    manipulateData().catch(e =>
      setError(e)
    )


  }, []);

  console.log(NAVEventData)

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"NAV"} data={NAVEventData}
            columns={NAVColumns} investmentID={investmentID}
            moneyColumns={moneyColumns}/>);
};

export default NAVTable;
