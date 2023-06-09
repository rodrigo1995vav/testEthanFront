import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { CContainer } from '@coreui/react';
// routes config
import routes from './../../routes';

class DefaultContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timezone: this.props.timezone
    }
  }

  shouldComponentUpdate () {
    if(this.props.timezone !== this.state.timezone)
    {
      this.setState({timezone: this.props.timezone});
      return true;
    }
    else
    {
      return false;
    }

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">
                    <div className="sk-spinner sk-spinner-pulse"></div></div>;

  render() {

    return (
      <main className="c-main">
        <CContainer fluid>
          <Suspense fallback={this.loading()}>
            <Switch>
              {routes.map((route, idx) => {
                return route.component ? (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    render={props => (
                        <route.component {...props}
                            notify={this.props.notify}
                            timezone={this.props.timezone}
                            />
                        )}
                  />
                  ) : (null);
              })}
              <Redirect from="/" to="/dashboard" />
            </Switch>
          </Suspense>
        </CContainer>
      </main>
    );
  }
}


export default DefaultContent;
