/* @flow */

import type {
    AddSymbolAction,
    AddTransactionAction,
    AddTransactionsAction,
    ChangePageSizeAction,
    DeletePortfolioAction,
    DeleteSymbolsAction,
    DeleteTransactionsAction,
    Dispatch,
    DownloadPortfolioAction,
    GetState,
    SetIexApiKeyAction,
    ThunkAction,
    Transaction,
} from "./types";
import csvParse from "csv-parse/lib/es5/sync";
import {transformGfToStocks} from "./transformers";
import axios from "axios";

export const IEX_ROOT = "https://cloud.iexapis.com/v1";
export const API_URL = "https://api.rat-capital.de/index.php";
// export const API_URL = "http://finance-app-api.test/index.php";
export const API_URL_STATS = "https://api.rat-capital.de/stats.php";

export function addSymbol(symbol: string): AddSymbolAction {
    return {symbol, type: "ADD_SYMBOL"};
}

export const HASH = "7nRtpzpN";

export function addTransaction(transaction: Transaction): AddTransactionAction {
    return {transaction, type: "ADD_TRANSACTION"};
}

export function addTransactions(transactions: Array<Transaction>): AddTransactionsAction {
    return {transactions, type: "ADD_TRANSACTIONS"};
}

export function changePageSize(nextPageSize: number): ChangePageSizeAction {
    return {pageSize: nextPageSize, type: "CHANGE_PAGE_SIZE"};
}

export function deletePortfolio(): DeletePortfolioAction {
    return {type: "DELETE_PORTFOLIO"};
}

export function deleteSymbols(symbols: Array<string>): DeleteSymbolsAction {
    return {symbols, type: "DELETE_SYMBOLS"};
}

export function deleteTransactions(transactions: Array<Transaction>): DeleteTransactionsAction {
    return {transactions, type: "DELETE_TRANSACTIONS"};
}

export function downloadPortfolio(): DownloadPortfolioAction {
    return {type: "DOWNLOAD_PORTFOLIO"};
}

export function setIexApiKey(iexApiKey: string): SetIexApiKeyAction {
    return {iexApiKey, type: "SET_IEX_API_KEY"};
}

export function setTransactions(transactions: Array<Transaction>): AddTransactionsAction {  ////    Code By Faisal
    return {transactions, type: "SET_TRANSACTIONS"};
}

// A timeout to periodically fetch new quotes.
let fetchAllQuotesTimeout: ?TimeoutID;

function clearFetchQuotesTimeout() {
    if (fetchAllQuotesTimeout != null) {
        clearTimeout(fetchAllQuotesTimeout);
        fetchAllQuotesTimeout = null;
    }
}

// Example data:
//
// {
//   date: '2018-04-09',
//   open: 169.88,
//   high: 173.09,
//   low: 169.845,
//   close: 170.05,
//   volume: 29017718,
//   unadjustedVolume: 29017718,
//   change: 1.67,
//   changePercent: 0.992,
//   vwap: 171.555,
//   label: 'Apr 9',
//   changeOverTime: 0,
// }
export function fetchSymbolData(symbol: string): ThunkAction {
    return function (dispatch: Dispatch, getState: GetState) {
        dispatch({type: "FETCH_SYMBOL_DATA_REQUEST"});
        fetch(
            `${IEX_ROOT}/stock/${symbol}/batch?types=chart,quote&range=1y&token=${getState().iexApiKey}`
        )
            .then((response) => {
                response
                    .json()
                    .then((symbolData) => {
                        dispatch({symbol, symbolData, type: "FETCH_SYMBOL_DATA_SUCCESS"});
                    })
                    .catch((error) => {
                        dispatch({error, type: "FETCH_SYMBOL_DATA_FAILURE"});
                    });
            })
            .catch((error) => {
                dispatch({error, type: "FETCH_SYMBOL_DATA_FAILURE"});
            });
    };
}

export function fetchAllQuotes(data=null): ThunkAction {
    return function (dispatch: Dispatch, getState: GetState) {
        function setFetchQuotesTimeout() {
            // Because more `fetchQuote` actions might be in flight, ensure the timer is empty and
            // synchronously create the next one (even though it was cleared once when this action was
            // first dispatched). This ensures no more than one timeout at a time is pending.
            clearFetchQuotesTimeout();
            setTimeout(() => {
                dispatch(fetchAllQuotes());
            }, 300000); // Fetch quotes minimally every 5 minutes. (5 * 60 * 1000)
        }

        const {symbols} = getState();
        if (symbols.length === 0) {
            // No need to do anything if there are no symbols to fetch. Restart the timer and bomb out
            // early.
            clearFetchQuotesTimeout();
            setFetchQuotesTimeout();
            return;
        }

        clearFetchQuotesTimeout();
        dispatch({type: "FETCH_QUOTES_REQUEST"});
        fetch(
            `${IEX_ROOT}/stock/market/batch?types=quote&token=${
                getState().iexApiKey
            }&symbols=${encodeURIComponent(data ? data.join(",") : getState().symbols.join(","))}`
        )
            .then((response) => {
                response
                    .json()
                    .then((data) => {
                        // Data comes back under the endpoint from which it was requested. In this case the key
                        // is `quote`. Unzip the response to match the shape of the store.
                        //
                        // See: https://iextrading.com/developer/docs/#batch-requests
                        const nextQuotes = {};
                        Object.keys(data).forEach((symbol) => {
                            nextQuotes[symbol] = data[symbol].quote;
                        });
                        dispatch({quotes: nextQuotes, type: "FETCH_QUOTES_SUCCESS"});
                    })
                    .catch((error) => {
                        dispatch({error, type: "FETCH_QUOTES_FAILURE"});
                    });
            })
            .catch((error) => {
                dispatch({error, type: "FETCH_QUOTES_FAILURE"});
            })
            .finally(() => {
                setFetchQuotesTimeout();
            });
    };
}
export function fetchAllExchanges(): ThunkAction {
    return function (dispatch: Dispatch, getState: GetState) {
        fetch("https://cloud.iexapis.com/v1/ref-data/exchanges?token=" + JSON.parse((localStorage['default'] || '{}'))['iexApiKey'])
            .then(res => res.json())
            .then(
                (result) => {
                    dispatch({exchanges: result, type: 'SET_EXCHANGES'});
                }
            )
    };
}

export function fetchSymbolPrice(): ThunkAction {
    return function (dispatch: Dispatch, getState: GetState) {

        fetch("https://cloud.iexapis.com/v1/ref-data/exchanges?token=" + JSON.parse((localStorage['default'] || '{}'))['iexApiKey'])
            .then(res => res.json())
            .then(
                (result) => {
                    dispatch({exchanges: result, type: 'SET_EXCHANGES'});
                }
            )
    };
}

export function fetchAllIexSymbols(): ThunkAction {
    return function (dispatch: Dispatch, getState: GetState) {
        dispatch({type: "FETCH_ALL_IEX_SYMBOLS_REQUEST"});
        fetch(`${IEX_ROOT}/ref-data/symbols?token=${getState().iexApiKey}`)
            .then((response) => {
                response
                    .json()
                    .then((data) => {
                        dispatch({allIexSymbols: data, type: "FETCH_ALL_IEX_SYMBOLS_SUCCESS"});
                    })
                    .catch((error) => {
                        dispatch({error, type: "FETCH_ALL_IEX_SYMBOLS_FAILURE"});
                    });
            })
            .catch((error) => {
                dispatch({error, type: "FETCH_ALL_IEX_SYMBOLS_FAILURE"});
            });
    };
}

export function fetchAllISINSymbols(isin: string): ThunkAction {
    return function (dispatch: Dispatch, getState: GetState) {
        dispatch({type: "FETCH_ALL_ISIN_SYMBOLS_REQUEST"});
        fetch(`${IEX_ROOT}/ref-data/isin?token=${getState().iexApiKey}&isin=${isin}`)
            .then((response) => {
                response
                    .json()
                    .then((data) => {
                        dispatch({allISINSymbols: data, type: "FETCH_ALL_ISIN_SYMBOLS_SUCCESS"});
                    })
                    .catch((error) => {
                        dispatch({error, type: "FETCH_ALL_ISIN_SYMBOLS_FAILURE"});
                    });
            })
            .catch((error) => {
                dispatch({error, type: "FETCH_ALL_ISIN_SYMBOLS_FAILURE"});
            });
    };
}

export function importTransactionsFile(file: Blob): ThunkAction {
    return function (dispatch: Dispatch) {
        dispatch({type: "IMPORT_TRANSACTIONS_FILE_REQUEST"});
        const fileReader = new FileReader();
        fileReader.onerror = () => {
            dispatch({type: "IMPORT_TRANSACTIONS_FILE_FAILURE"});
        };
        fileReader.onload = () => {
            const parsedCsv = csvParse(fileReader.result, {columns: true});
            dispatch(addTransactions(transformGfToStocks(parsedCsv)));
            dispatch(fetchAllQuotes());
            dispatch({type: "IMPORT_TRANSACTIONS_FILE_SUCCESS"});
        };
        fileReader.readAsText(file);
    };
}
////    Code by Faisal
export async function getTransactionsFromDb() {
    let data = await axios.get(API_URL)
    return data.data
}

export function setTransactionsInDb(data) {
    let bodyFormData = new FormData();
    Object.keys(data).forEach(key => bodyFormData.append(key, data[key]));
    axios({
        method: 'POST',
        url: API_URL,
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export function delTransactionsInDb(data) {
    axios({
        method: 'DELETE',
        url: API_URL,
        data: {'ids':data.map(item => item.db_id)},
        headers: { "Content-Type": "multipart/form-data" },
    });
}
////
