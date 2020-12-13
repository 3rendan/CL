#include <iostream>
#include <exception>
#include <sstream>
#include <string>
#include <cmath>
#include <vector>

using namespace std;

class Date
{
private:
    int serialDate;
    
public:
    static int SerialDate(int nDay, int nMonth, int nYear)
    {
        // Excel/Lotus 123 have a bug with 29-02-1900. 1900 is not a
        // leap year, but Excel/Lotus 123 think it is...
        if (nDay == 29 && nMonth == 02 && nYear==1900)
            return 60;

        // DMY to Modified Julian calculated with an extra subtraction of 2415019.
        long nSerialDate = 
            int(( 1461 * ( nYear + 4800 + int(( nMonth - 14 ) / 12) ) ) / 4) +
            int(( 367 * ( nMonth - 2 - 12 * ( ( nMonth - 14 ) / 12 ) ) ) / 12) -
            int(( 3 * ( int(( nYear + 4900 + int(( nMonth - 14 ) / 12) ) / 100) ) ) / 4) +
            nDay - 2415019 - 32075;

        if (nSerialDate < 60)
            {
            // Because of the 29-02-1900 bug, any serial date 
            // under 60 is one off... Compensate.
            nSerialDate--;
            }

        return (int)nSerialDate;
    }
    
    static void SerialDateToDMY(int nSerialDate, int &nDay, int &nMonth, int &nYear)
    {
        // Excel/Lotus 123 have a bug with 29-02-1900. 1900 is not a
        // leap year, but Excel/Lotus 123 think it is...
        if (nSerialDate == 60)
            {
            nDay    = 29;
            nMonth  = 2;
            nYear   = 1900;
            return;
            }
        else if (nSerialDate < 60)
            {
            // Because of the 29-02-1900 bug, any serial date 
            // under 60 is one off... Compensate.
            nSerialDate++;
            }

        // Modified Julian to DMY calculation with an addition of 2415019
        int l = nSerialDate + 68569 + 2415019;
        int n = int(( 4 * l ) / 146097);
        l = l - int(( 146097 * n + 3 ) / 4);
        int i = int(( 4000 * ( l + 1 ) ) / 1461001);
        l = l - int(( 1461 * i ) / 4) + 31;
        int j = int(( 80 * l ) / 2447);
        nDay = l - int(( 2447 * j ) / 80);
        l = int(j / 11);
        nMonth = j + 2 - ( 12 * l );
        nYear = 100 * (n - 49) + i + l;
    }

    int day()
    {
        return serialDate;
    }

    Date( string s)
    {
        stringstream str(s);
        int month, day, year;
        char t1, t2;
        str >> month >> t1 >> day >> t2 >> year;
        if( month < 0 || month > 12 || day < 0 || day > 31 || year < 0)
            throw "Date::Invalid Date";
        serialDate = SerialDate( day, month, year);
        //cout << month << " " << day << " " << year << " | " << serialDate << endl;
    }
    friend ostream & operator << (ostream & os, const Date & d);
};

ostream & operator << (ostream & os, const Date & d)
{
    int month, day, year;
    Date::SerialDateToDMY( d.serialDate, day, month, year);
    os << month << "/" << day << "/" << year;
    return os;
}

class CashFlow
{
public:
    Date date;
    double amount;
    double numeraire;

    int day()
    {
        return date.day();
    }
    CashFlow( Date d, double a, double n) : date(d)
    {
        amount = a;
        numeraire = n;
    }
};


class Calculator
{
public:
    vector <CashFlow> cashFlows;
    
public:
    double calculateNPV( CashFlow startNav, CashFlow endNav, double rate)
    {
        const double DAYSPERYEAR = 365.0;

        double days0 = endNav.day() - startNav.day();
        double sum = startNav.amount * exp(-rate * days0 / DAYSPERYEAR) / startNav.numeraire;

        for (CashFlow c : cashFlows)
            {
            if (c.day() <= startNav.day())
                continue;
            long days = c.day()- endNav.day();
            if (days > 0)
                continue;
            sum += c.amount * exp(-rate * days / DAYSPERYEAR) / c.numeraire;
            }
        sum = sum - endNav.amount / endNav.numeraire;
        return sum;
    }

    double calculateIRR2( CashFlow startNav, CashFlow endNav)
    {
        const int MAXIT = 60;
        double x1 = -20.0;
        double x2 = 12.0;
        const double xacc = 1.0e-15; // accuracy 

        double Default = 0.0;
        if (calculateNPV( startNav, endNav, Default) == 0.0)
            return Default;
        double fl = calculateNPV( startNav, endNav, x1);
        double fh = calculateNPV( startNav, endNav, x2);
        if (fl == 0.0)
            return x1;
        if (fh == 0.0)
            return x2;
        if ((fl > 0.0 && fh > 0.0) || (fl < 0.0 && fh < 0.0))
            {
            cout << "CalculateIRR:Root Not Bracketed" << endl;
            return nan("");
            }
        double xl = x1;
        double xh = x2;
        double ans = NAN;
        for (int j = 0; j < MAXIT; j++)
            {
            double xm = 0.5*(xl + xh);
            double fm = calculateNPV( startNav, endNav, xm);
            double s = sqrt( fm*fm - fl*fh);
            if (s == 0.0)
                return ans;
            double xnew = xm + (xm-xl)*((fl >= fh) ? 1.0 : -1.0) * fm / s;
            if (abs(xnew-ans) <= xacc)
                return ans;
            ans = xnew;
            double fnew = calculateNPV( startNav, endNav, ans);
            if (fnew == 0.0)
                return ans;
            if ((fnew >= 0.0 && fm < 0.0) || (fnew < 0.0 && fm > 0.0))
                {
                xl = xm;
                fl = fm;
                xh = ans;
                fh = fnew;
                }
            else if ((fnew >= 0.0 && fl < 0.0) || (fnew < 0.0 && fl > 0.0))
                {
                xh = ans;
                fh = fnew;
                } 
            else if ((fnew >= 0.0 && fh < 0.0) || (fnew < 0.0 && fh > 0.0))
                {
                xl = ans;
                fl = fnew;
                } 
            else
                {
                cout << "CalculateIRR:Should Never Get Here" << endl;
                cout << fnew << " " << fm << " " << fl << " " << fh << endl;
                return nan("");
                }
            if (abs(xh - xl) <= xacc)
                {
                return ans;
                }
            }
        cout << "CalculateIRR:Max Iterations Exceeded" << endl;
        return nan("");
    }


    double calculateIRR( CashFlow startNav, CashFlow endNav)
    {
        double ans = calculateIRR2( startNav, endNav);
        if( isnan(ans))
            return ans;
        return exp(ans) - 1.0;
    }

};// CLASS

int main( void)
{

    Calculator calc;
    string type;
    while (true)
        {
        cin >> type;
        if (type == "CF")
            {
            string string1, string2, string3;
            cin >> string1 >> string2 >> string3;
            Date d(string1);
            double amt = stod(string2);
            double numer = stod(string3);
            CashFlow cf (d, amt, numer);
            calc.cashFlows.push_back(cf);
            }
        else if (type == "NAV")
            {
            //cout << type << endl;
            string string1, string2, string3;
            cin >> string1 >> string2 >> string3;
            Date d1(string1);
            double amt = stod(string2);
            double numer = stod(string3);
            CashFlow start(d1, amt, numer);
            //cout << d1 << " " << amt << " " << numer << endl;
            cin >> string1 >> string2 >> string3;
            Date d2(string1);
            amt = stod(string2);
            numer = stod(string3);
            CashFlow end(d2, amt, numer);
            //cout << d2 << " " << amt << " " << numer << endl;
            double irr = calc.calculateIRR( start, end);
            cout << "IRR = " << irr << endl;
            }
        else if (type == "END")
            exit(0);
        else
            throw "Invalid Input Command";
        }
    
    //Date d("02/03/2020");
    //cout << d << endl;
}
