import axios from 'axios';
import csv from 'csv-parser';
import fs from 'fs';
import { Transaction } from './types';

const TRANSACTIONS_FILE = './transactions.csv';

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

async function getExchangeRate(token: string): Promise<number> {
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`
  );
  return response.data.USD;
}

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

async function main() {
  const latestPortfolioValue = await getPortfolioValue();
  console.log(`Latest portfolio value: $${latestPortfolioValue.toFixed(2)}`);

  const token = 'BTC';
  const portfolioValueForToken = await getPortfolioValue(undefined, token);
  console.log(`Latest portfolio value for ${token}: $${portfolioValueForToken.toFixed(2)}`);

  const date = new Date('2022-01-01');
  const timestamp = Math.floor(date.getTime() / 1000);
  const portfolioValueOnDate = await getPortfolioValue(timestamp);
  console.log(`Portfolio value per token on ${date.toISOString()}: $${portfolioValueOnDate.toFixed(2)}`);

  const tokenOnDate = 'ETH';
  const portfolioValueForTokenOnDate = await getPortfolioValue(timestamp, tokenOnDate);
  console.log(`Portfolio value of ${tokenOnDate} on ${date.toISOString()}: $${portfolioValueForTokenOnDate.toFixed(2)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});