import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

var auth = require('./Auth');

export default function withAuth(ComponentToProtect) {
    return class extends Component {
        constructor() {
            super();
            this.state = {
                loading: true,
                redirect: false,
                refresher: false
            };
        }

        async componentDidMount() {
          var state = this.state;
          state.loading = false;
          const loggedIn = await auth.loggedIn();
          if(!loggedIn)
          {
            const refreshTokenValid = await auth.refreshTokenValid();
            state.redirect = (!refreshTokenValid) ? true : false;
          }
          if(!state.redirect)
          {
            state.refresher = auth.initiateTokenRefresher();
          }
          this.setState(state);

        }

        componentWillUnmount(){
          if(this.state.refresher.timeout !== null)
          {
            clearTimeout(this.state.refresher.timeout);
          }
          clearInterval(this.state.refresher.interval);
        }

        render() {
            const { loading, redirect } = this.state;

            if (loading) {
                return null;
            }
            if (redirect) {
                return <Redirect to={process.env.REACT_APP_LOGIN_URL} /> ;
            }
            return <ComponentToProtect {...this.props } />;
        }
    }
}
