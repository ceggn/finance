import React, {Component} from 'react';
import {HASH} from "./actions";


export class Login extends Component {
    constructor(props) {
        super(props);
        this._onInputChange = this._onInputChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);

        this.state = {
            email: "",
            password: ""
        }
    }

    componentDidMount() {
        sessionStorage.getItem('auth-token') !== null && sessionStorage.getItem('auth-token') === HASH ?
            this.props.history.push('/') : this.props.history.push('/login')
    }

    _onInputChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    _handleSubmit(e) {
        e.preventDefault();
        let hardcodedCred = {
            email: 'admin@finance.com',
            password: 'finance.com!@#$'
        }

        if ((this.state.email === hardcodedCred.email) && (this.state.password === hardcodedCred.password)) {
            sessionStorage.setItem('auth-token', HASH);
            this.props.history.push('/');
        } else {
            alert('wrong email or password combination');
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-4"></div>
                <div className="col-md-4">
                    <div className="login-page">
                        <br/>
                        <br/>
                        <h2>Login In</h2>
                        <form autoComplete="off" onSubmit={this._handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="exampleInputEmail1"
                                    name="email"
                                    aria-describedby="emailHelp"
                                    placeholder="Enter email"
                                    value={this.state.email}
                                    onChange={this._onInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    className="form-control"
                                    id="exampleInputPassword1"
                                    placeholder="Password"
                                    value={this.state.password}
                                    onChange={this._onInputChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </form>
                        <br/>
                        <br/>
                    </div>
                </div>
                <div className="col-md-4"></div>
            </div>

        );
    }
}
