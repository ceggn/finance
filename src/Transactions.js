/* @flow */

import * as React from "react";
import {Button, Col, Row} from "reactstrap";
import type {AppSettings, AppState, Dispatch, Quote, Transaction} from "./types";
import {changePageSize, deleteTransactions, delTransactionsInDb, HASH} from "./actions";
import {currencyFormatter, numberFormatter} from "./formatters";
import {Link} from "react-router-dom";
import PortfolioContainer from "./PortfolioContainer";
import ReactTable from "react-table";
import {connect} from "react-redux";
import selectTableHOC from "react-table/lib/hoc/selectTable";

type StateProps = {
    appSettings: AppSettings,
    dispatch: Dispatch,
    quotes: { [symbol: string]: Quote },
    transactions: Array<Transaction>,
};

type Props = StateProps;

type State = {
    selectedTransactionIds: Set<number>,
};

const SelectReactTable = selectTableHOC(ReactTable);

const TABLE_COLUMNS = [
    {
        accessor: "companyName",
        Cell: (props) => (props.value == null ? "..." : props.value),
        Header: "Name",
        headerClassName: "text-left",
    },
    {
        accessor: "symbol",
        Cell: (props) => <Link to={`/stocks/${props.value}`}>{props.value}</Link>,
        Header: "Symbol",
        headerClassName: "text-left",
    },
    {accessor: "type", Header: "Type", headerClassName: "text-left"},
    {
        accessor: "date",
        Cell: (props) => <time>{props.value}</time>,
        Header: "Date",
        headerClassName: "text-left",
    },
    {
        accessor: "shares",
        Cell: (props) => (
            <div className="text-right">
                {props.value == null ? "..." : numberFormatter.format(props.value)}
            </div>
        ),
        Header: "Shares",
        headerClassName: "text-right",
    },
    {
        accessor: "price",
        Cell: (props) => (
            <div className="text-right">
                {props.value == null ? "..." : currencyFormatter.format(props.value)}
            </div>
        ),
        Header: "Price",
        headerClassName: "text-right",
    },
    {
        accessor: "commission",
        Cell: (props) => (
            <div className="text-right">
                {props.value == null ? "..." : currencyFormatter.format(props.value)}
            </div>
        ),
        Header: "Commission",
        headerClassName: "text-right",
    },
];

class Transactions extends React.Component<Props, State> {
    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        // If any currently selected transactions are not in the next props update, remove them from the
        // internal selected transactions `Set` to stay up-to-date.
        let hasChanges = false;
        const nextTransactionIds = new Set(nextProps.transactions.map((transaction) => transaction.id));
        const nextSelectedTransactionIds = new Set<number>();
        for (const transactionId of prevState.selectedTransactionIds) {
            if (nextTransactionIds.has(transactionId)) nextSelectedTransactionIds.add(transactionId);
            else hasChanges = true;
        }

        if (hasChanges) return {selectedTransactionIds: nextSelectedTransactionIds};
        else return null;
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            // This is *not* treated as immutable. Object identity will not always correctly indicate
            // when changes are made.
            selectedTransactionIds: new Set(),
        };
    }

    componentDidMount() {
        sessionStorage.getItem('auth-token') === null && sessionStorage.getItem('auth-token') != HASH ?
            this.props.history.push('/login') : this.props.history.push('/transactions')
    }

    handleDeleteSelectedTransactions = () => {
        const transactionsToDelete = this.props.transactions.filter((transaction) =>
            this.state.selectedTransactionIds.has(transaction.id)
        );
        this.props.dispatch(deleteTransactions(transactionsToDelete));
        delTransactionsInDb(transactionsToDelete);
    };

    handlePageSizeChange = (nextPageSize: number) => {
        this.props.dispatch(changePageSize(nextPageSize));
    };

    handleToggleAllTransactionIds = (isSelected: boolean) => {
        if (this.isAllTransactionIdsSelected()) {
            this.setState({selectedTransactionIds: new Set()});
        } else {
            this.setState({
                selectedTransactionIds: new Set(
                    this.props.transactions.map((transaction) => transaction.id)
                ),
            });
        }
    };

    handleToggleTransactionIdSelected = (transactionId: string) => {
        const normalizedTransactionId = parseInt(transactionId.replace(/^select-/, ""), 10);
        if (this.isTransactionIdSelected(normalizedTransactionId)) {
            this.state.selectedTransactionIds.delete(normalizedTransactionId);
        } else {
            this.state.selectedTransactionIds.add(normalizedTransactionId);
        }
        this.forceUpdate();
    };

    isAllTransactionIdsSelected = () => {
        return this.state.selectedTransactionIds.size === this.props.transactions.length;
    };

    isTransactionIdSelected = (transactionId: number) => {
        return this.state.selectedTransactionIds.has(transactionId);
    };

    render() {
        const tableDataTransactions = this.props.transactions.map((transaction) => {
            const quote = this.props.quotes[transaction.symbol];
            return {
                ...transaction,
                companyName: quote == null ? null : quote.companyName,
            };
        });

        const generatedMarketValueTotal = this.props.symbols.map((symbol) => {
            const quote = this.props.quotes[symbol];
            const transactions = this.props.transactions.filter(
                (transaction) => transaction.symbol === symbol
            );
            let totalShares = 0;
            let marketValue = 0;
            let manualPrice = 0;
            transactions.forEach((transaction) => {
                // Only summing 'Buy' transactions.
                if (transaction.type !== "Buy") return;
                totalShares += transaction.shares;
                manualPrice = transaction.latestPrice;

                if (quote != null) {
                    if (quote.latestPrice == null) {
                        marketValue += manualPrice * transaction.shares

                    } else {
                        marketValue += quote.latestPrice * transaction.shares;
                    }
                } else if (manualPrice != 0) {
                    marketValue += manualPrice * transaction.shares;
                };
            });


            const showReturns = totalShares > 0 && quote != null;
            return {
                marketValue: marketValue,
            };
        });
        const deleteDisabled =
            this.props.transactions.length === 0 || this.state.selectedTransactionIds.size === 0;
        let marketValueTotal = 0;
        generatedMarketValueTotal.forEach(element => marketValueTotal = marketValueTotal + element.marketValue);
        console.log("Transaction value");
        console.log(marketValueTotal);
        return (
            <PortfolioContainer
                marketValueTotal={marketValueTotal}
                deleteDisabled={deleteDisabled}
                onDelete={this.handleDeleteSelectedTransactions}
            >
                <Row className="mb-3">
                    <Col>
                        <SelectReactTable
                            columns={TABLE_COLUMNS}
                            data={tableDataTransactions}
                            defaultSorted={[{desc: false, id: "symbol"}]}
                            getPaginationProps={() => ({
                                className: "pt-2",
                                NextComponent: (props) => <Button className="btn-sm" outline {...props} />,
                                PreviousComponent: (props) => <Button className="btn-sm" outline {...props} />,
                                showPageJump: false,
                            })}
                            isSelected={this.isTransactionIdSelected}
                            keyField="id"
                            noDataText="Noch keine Transaktionen. Fügen Sie eine mit dem unten stehenden Formular hinzu."
                            onPageSizeChange={this.handlePageSizeChange}
                            pageSize={this.props.appSettings.pageSize}
                            selectAll={this.isAllTransactionIdsSelected()}
                            selectType="checkbox"
                            toggleAll={this.handleToggleAllTransactionIds}
                            toggleSelection={this.handleToggleTransactionIdSelected}
                        />
                    </Col>
                </Row>
            </PortfolioContainer>
        );
    }
}

export default (connect<Props, {}, _, _, _, _>((state: AppState) => ({
    appSettings: state.appSettings,
    quotes: state.quotes,
    symbols: state.symbols,
    transactions: state.transactions,
}))(Transactions): React.ComponentType<*>);
