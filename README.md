# Portfolio Value Calculator
This is a simple portfolio value calculator that calculates the value of a portfolio based on a CSV file containing the transaction history of the portfolio. The CSV file is parsed using the csv-parser library and the transactions are stored in memory using the Map data structure. The value of the portfolio is calculated based on the current exchange rates of the tokens.

#### Design Decisions
### TypeScript
TypeScript was chosen for this project due to its strong typing system and support for modern ECMAScript features. The use of types improves code readability and helps catch errors during development. The async/await syntax is used for asynchronous programming, which simplifies the code and makes it more readable.

### csv-parser
The csv-parser library was chosen for parsing the CSV file because it is lightweight, fast and easy to use. It can be easily integrated with Node.js streams, which allows for efficient processing of large files.

### axios
The axios library was chosen for making HTTP requests to the CryptoCompare API because it provides a simple and easy-to-use interface for making HTTP requests, supports promises, and is widely used.

### Map
The Map data structure was used to store the transactions because it provides efficient lookups and insertions, and it is easy to iterate over the entries.

### Functions
getTransactions function
The getTransactions function reads the transaction data from a CSV file and returns an array of Transaction objects. The csv-parser library is used to parse the CSV file, and the resulting data is converted to Transaction objects.

### getExchangeRate function
The getExchangeRate function makes an HTTP request to the CryptoCompare API to get the current exchange rate for a given token. The function returns the exchange rate as a number.

### getPortfolioValue function
The getPortfolioValue function calculates the current value of a portfolio based on the transaction history and the current exchange rates of the tokens. It takes two optional parameters: timestamp and token. If timestamp is provided, the portfolio value is calculated based on the transaction history up to that timestamp. If token is provided, the portfolio value is calculated only for that token.

The Map data structure is used to store the balance of each token in the portfolio. The transaction history is iterated over, and the balance of each token is updated based on the type of transaction (DEPOSIT or WITHDRAWAL). Once the balances are updated, the current value of the portfolio is calculated by iterating over the Map and multiplying the balance of each token by its current exchange rate.

### main function
The main function is the entry point of the program. It calls the getPortfolioValue function with various parameters to calculate the value of the portfolio. The results are logged to the console.

### Running the program
To run the program, execute the following command in the terminal:

npm start

This will run the main function and log the results to the console. The CSV file containing the transaction history should be located in the root directory of the project and named transactions.csv.

### Follow the cookie
```
import axios from 'axios';
import csv from 'csv-parser';
import fs from 'fs';
import { Transaction } from './types';

const TRANSACTIONS_FILE = './transactions.csv';
```
Importing necessary modules for the code: axios for making HTTP requests, csv-parser for parsing CSV files, fs for working with the file system, and the Transaction interface from the types.ts file.
Defining a constant TRANSACTIONS_FILE to hold the path to the CSV file containing the transactions.
```
async function getTransactions(): Promise<Transaction[]> {
  const transactions: Transaction[] = [];
  const parser = fs.createReadStream(TRANSACTIONS_FILE).pipe(csv());
  for await (const transaction of parser) {
    const timestamp = Number(transaction.timestamp);
    const amount = Number(transaction.amount);
    transactions.push({
      timestamp,
      transaction_type: transaction.transaction_type,
      token: transaction.token,
      amount,
    });
  }
  return transactions;
}

```
Defining an asynchronous function getTransactions that returns a Promise of an array of Transaction objects.
Creating an empty array transactions to hold the parsed transactions.
Creating a CSV parser by reading the TRANSACTIONS_FILE using fs.createReadStream() and piping it to csv().
Using a for await...of loop to iterate over the parsed transactions one by one.
For each transaction, parsing its timestamp and amount fields into numbers.
Pushing a new Transaction object with the parsed fields into the transactions array.
Returning the transactions array.
```
async function getExchangeRate(token: string): Promise<number> {
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`
  );
  return response.data.USD;
}

```
Defining an asynchronous function getExchangeRate that takes a token string as a parameter and returns a Promise of a number representing the exchange rate of the token to USD.
Making a GET request to the CryptoCompare API using axios.get() with the token parameter interpolated into the URL.
Returning the exchange rate value from the API response.

```
async function getPortfolioValue(timestamp?: number, token?: string): Promise<number> {
  const transactions = await getTransactions();
  const portfolio = new Map<string, number>();
  for (const transaction of transactions) {
    if (timestamp && transaction.timestamp > timestamp) {
      // Ignore transactions that occur after the specified timestamp
      continue;
    }
    const balance = portfolio.get(transaction.token) || 0;
    if (transaction.transaction_type === 'DEPOSIT') {
      portfolio.set(transaction.token, balance + transaction.amount);
    } else {
      portfolio.set(transaction.token, balance - transaction.amount);
    }
  }
  let portfolioValue = 0;
  for (const [token, balance] of portfolio.entries()) {
    let exchangeRate = 1;
    if (token !== 'USD') {
      exchangeRate = await getExchangeRate(token);
    }
    if (token === 'USD' || (token === token && token)) {
      portfolioValue += balance * exchangeRate;
    }
  }
  return portfolioValue;
}

```
Defining an asynchronous function getPortfolioValue that takes two optional parameters, timestamp and token, and returns a Promise of a number representing the portfolio value.
Calling getTransactions() to retrieve all transactions.
Creating a new Map object portfolio to


Finally, the main function is defined, which is the entry point of the program. Inside the main function, the getPortfolioValue function is called four times with different arguments to obtain the portfolio value for different scenarios.

The first call to getPortfolioValue is made with no arguments, which will retrieve the latest portfolio value. The second call is made with a token argument set to 'BTC', which will retrieve the latest portfolio value for Bitcoin. The third call is made with a timestamp argument set to the Unix timestamp of January 1st, 2022, which will retrieve the portfolio value for all tokens on that date. The fourth call is made with both timestamp and token arguments, set to the Unix timestamp of January 1st, 2022, and the token 'ETH', respectively. This will retrieve the portfolio value for Ethereum on January 1st, 2022.

Each of the results is then printed to the console with a corresponding message using console.log(). If an error occurs at any point, it will be caught and logged to the console, and the program will exit with a non-zero status code using process.exit().