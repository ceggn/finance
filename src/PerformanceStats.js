import React, {Component} from "react";
import {Table} from "reactstrap";
import {API_URL_STATS, IEX_ROOT} from "./actions";

export default class PerformanceStats extends Component {

    constructor(props) {
        super(props);
        this.state = {
            marketValueTotal: props.marketValueTotal,
            fcraktien: 0,
            depotjulius: 0,
            darlehen: 0,
            kontostand: 0,
            dividende_2021: 0,
            dividende_2020: 0,
            dividende_2019: 0,
            showingAlert: false,
            geldtransfer_2021: 0,
            geldtransfer_2020: 0,
            geldtransfer_2019: 0,
            zwischensumme: 0,
            liquidationssaldo: 0,
            ergebnis: 0
        }

        this.__handleFieldChange = this.__handleFieldChange.bind(this);
        this.__handleSubmit = this.__handleSubmit.bind(this);
    }

    componentDidMount() {
        fetch(`${API_URL_STATS}`).then(res => res.json()).then((result) => {
            this.setState({
                darlehen: parseFloat(result[0]['darlehen']).toFixed(2),
                kontostand: parseFloat(result[0]['kontostand']).toFixed(2),
                dividende_2021: parseFloat(result[0]['dividende_2021']).toFixed(2),
                dividende_2020: parseFloat(result[0]['dividende_2020']).toFixed(2),
                dividende_2019: parseFloat(result[0]['dividende_2019']).toFixed(2),
                geldtransfer_2021: parseFloat(result[0]['geldtransfer_2021']).toFixed(2),
                geldtransfer_2020: parseFloat(result[0]['geldtransfer_2020']).toFixed(2),
                geldtransfer_2019: parseFloat(result[0]['geldtransfer_2019']).toFixed(2),
            });
        }).then(
            fetch(`${IEX_ROOT}/stock/FC9-GY/price?token=${JSON.parse((localStorage['default'] || '{}'))['iexApiKey']}`)
                .then(res => res.json())
                .then(
                    (result) => {
                        this.setState({fcraktien: (result * 1406000).toFixed(2)}, () => {
                            this.setState({
                                depotjulius: (this.state.marketValueTotal).toFixed(2)
                            }, () => {
                                this.setState({
                                    zwischensumme:
                                        (parseFloat(this.state.depotjulius) - parseFloat(this.state.darlehen)).toFixed(2)
                                }, () => {
                                    this.setState({
                                        liquidationssaldo:
                                            (parseFloat(this.state.kontostand) + parseFloat(this.state.zwischensumme)).toFixed(2)
                                    }, () => {
                                        this.setState({
                                            ergebnis: (this.state.liquidationssaldo - this.state.dividende_2021 - this.state.dividende_2020 - this.state.dividende_2019 - this.state.geldtransfer_2021 - this.state.geldtransfer_2020 - this.state.geldtransfer_2019).toFixed(2)
                                        })
                                    })
                                })
                            })
                        })
                    }
                )
        )
    }

    __handleSubmit(event) {
        const formData = new FormData();
        formData.append('darlehen', parseFloat(this.state.darlehen).toFixed(2));
        formData.append('kontostand', parseFloat(this.state.kontostand).toFixed(2));
        formData.append('dividende_2021', parseFloat(this.state.dividende_2021).toFixed(2));
        formData.append('dividende_2020', parseFloat(this.state.dividende_2020).toFixed(2));
        formData.append('dividende_2019', parseFloat(this.state.dividende_2019).toFixed(2));
        formData.append('geldtransfer_2021', parseFloat(this.state.geldtransfer_2021).toFixed(2));
        formData.append('geldtransfer_2020', parseFloat(this.state.geldtransfer_2020).toFixed(2));
        formData.append('geldtransfer_2019', parseFloat(this.state.geldtransfer_2019).toFixed(2));

        fetch(`${API_URL_STATS}`, {
            method: 'POST',
            body: formData,
        }).then(response => response.json()).then(data => {

        })
        this.setState({showingAlert: true});
        setTimeout(() => {
            this.setState({
                showingAlert: false
            });
        }, 2000);
    }

    __handleFieldChange(event) {
        //simple data fields
        this.setState({
            [event.target.name]: parseFloat(event.target.value).toFixed(2)
        }, () => {
            this.setState({
                zwischensumme:
                    (this.state.depotjulius - this.state.darlehen).toFixed(2),
                liquidationssaldo:
                    (parseFloat(this.state.kontostand) + parseFloat(this.state.zwischensumme)).toFixed(2),
                ergebnis: (this.state.liquidationssaldo - this.state.dividende_2021 - this.state.dividende_2020 - this.state.dividende_2019 - this.state.geldtransfer_2021 - this.state.geldtransfer_2020 - this.state.geldtransfer_2019).toFixed(2)
            })
        })

        // formulas

    }


    render() {
        return (
            <React.Fragment>
                <div className="card">
                    <div className="card-body">
                        <Table>
                            <tbody>
                            <h4>Depot</h4>
                            <tr>
                                <td>Portfolio Gesamtwert</td>
                                <td>{(parseFloat(this.state.fcraktien) + parseFloat(this.state.depotjulius)).toLocaleString("de-DE")}</td>
                            </tr>
                            <tr>
                                <td>FCR Aktien</td>
                                <td>{parseFloat(this.state.fcraktien).toLocaleString("de-DE")}</td>
                            </tr>
                            <tr>
                                <td>Depot Julius Bär</td>
                                <td>{parseFloat(this.state.depotjulius).toLocaleString("de-DE")}</td>
                            </tr>
                            <h4>Liquidation</h4>
                            <tr>
                                <td>Darlehen</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"darlehen"} step="any" value={this.state.darlehen}/></td>
                            </tr>
                            <tr>
                                <td>Zwischensumme:</td>
                                <td>{parseFloat(this.state.zwischensumme).toLocaleString("de-DE")}</td>
                            </tr>
                            <tr>
                                <td>Kontostand:</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"kontostand"}
                                           value={this.state.kontostand}
                                /></td>
                            </tr>
                            <tr>
                                <td>Liquidationssaldo:</td>
                                <td>{parseFloat(this.state.liquidationssaldo).toLocaleString("de-DE")}</td>
                            </tr>
                            <tr>
                                <td>Dividende 2021:</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"dividende_2021"} value={this.state.dividende_2021}/></td>
                            </tr>
                            <tr>
                                <td>Dividende 2020:</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"dividende_2020"} value={this.state.dividende_2020}/></td>
                            </tr>
                            <tr>

                                <td>Dividende 2019</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"dividende_2019"} value={this.state.dividende_2019}/></td>
                            </tr>
                            <tr>
                                <td>Geldtransfer 2021</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"geldtransfer_2021"} value={this.state.geldtransfer_2021}/></td>
                            </tr>
                            <tr>
                                <td>Geldtransfer 2020</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"geldtransfer_2020"} value={this.state.geldtransfer_2020}/></td>
                            </tr>
                            <tr>
                                <td>Geldtransfer 2019</td>
                                <td><input type="number" className="form-text" onChange={this.__handleFieldChange}
                                           name={"geldtransfer_2019"} value={this.state.geldtransfer_2019}/></td>
                            </tr>
                            <tr>
                                <td>Ergebnis:</td>
                                <td>{parseFloat(this.state.ergebnis).toLocaleString("de-DE")}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <div className="position-relative form-group">
                                        <button type="submit" className="btn btn-primary btn-sm"
                                                onClick={this.__handleSubmit}>Speichern
                                        </button>
                                    </div>


                                </td>
                            </tr>
                            </tbody>
                        </Table>
                        {this.state.showingAlert ? <React.Fragment>
                            <div
                                className={`alert alert-success ${this.state.showingAlert ? 'alert-shown' : 'alert-hidden'}`}>
                                Data Saved
                            </div>

                        </React.Fragment> : ''}
                    </div>
                </div>
                <br/>
            </React.Fragment>
        );
    }

}
