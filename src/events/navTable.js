import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getInvestment} from '../serverAPI/investments.js'
import {getTransfers} from '../serverAPI/transfers.js'

import {getIrr} from '../serverAPI/irr'

import {calcNAV, calcNetContribute, myDateSort} from '../SpecialColumn'

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

function calcRemainingCommitment(data, remaining_commitment) {
  if (data === undefined) {
    return remaining_commitment;
  }
  if (remaining_commitment === undefined) {
    return undefined;
  }

  data.map((datum) => {
    if (datum.type === 'CONTRIBUTION') {
      let main = datum.main;
      try {
        main = datum.main ? parseFloat(datum.main.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= main;

      let fees = datum.fees;
      try {
        fees = datum.fees ? parseFloat(datum.fees.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= fees;

      let tax = datum.tax;
      try {
        tax = datum.tax ? parseFloat(datum.tax.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= tax;
    }
    else if (datum.type === 'DISTRIBUTION') {
      let recallable = datum.recallable;
      try {
        recallable = datum.recallable ? parseFloat(datum.recallable.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= recallable;
    }
  });
  return remaining_commitment;
}

const NAVTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const [error, setError] = useState(null);
  const [NAVColumns, setNAVColumns] = useState(['Date', 'NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR']);
  const [moneyColumns, setMoneyColumns] = useState(['NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR']);

  const investmentID = props.investmentID;



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

      const investment = await getInvestment(investmentID);
      if (investment.invest_type === 'commit') {
        setNAVColumns(['Date', 'NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR', 'Remaining Commitment'])
        setMoneyColumns(['NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR', 'Remaining Commitment'])
      }

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
      let remaining_commitment = investment.invest_type === 'commit' ? investment.commitment : undefined;
      let last_pl = null;
      while (minDate <= finalMonth) {
        nav = calcNAV(groups[minDate], investmentID, prev_nav);
        prelim_nav = calcNAV(groups[minDate], investmentID, prev_nav);
        netContribute = calcNetContribute(groups[minDate], investmentID, netContribute);
        remaining_commitment = calcRemainingCommitment(groups[minDate], remaining_commitment);
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
                          'p/l_(mtd)': mtd, remaining_commitment: remaining_commitment,
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
                          remaining_commitment: remaining_commitment,
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
