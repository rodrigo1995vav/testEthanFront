import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import './App.scss';

import withAuth from './services/withAuth';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Pages
const Login = React.lazy(() => import('./views/Login/Login'));
const ResetPassword = React.lazy(() => import('./views/ResetPassword/ResetPassword'));
const Activate = React.lazy(() => import('./views/Activate/Activate'));
const ActivateGuest = React.lazy(() => import('./views/ActivateGuest/ActivateGuest'));
const Register = React.lazy(() => import('./views/Register/Register'));
const Joining = React.lazy(() => import('./views/Joining/Joining'));
const Home = React.lazy(() => import('./views/Home/Home'));
const Website = React.lazy(() => import('./views/Website/Website'));


class App extends Component {

  render() {
    return (
      <HashRouter>
          <React.Suspense fallback={loading()}>
            <Switch>
              <Route exact path="/login/:code?" name="Login" render={props => <Login {...props}/>} />
              <Route exact path="/reset_password/:token" name="Reset Password" render={props => <ResetPassword {...props}/>} />
              <Route exact path="/activate/:token" name="Account Activation" render={props => <Activate {...props}/>} />
              <Route exact path="/activate_guest/:token" name="Guest Activation" render={props => <ActivateGuest {...props}/>} />
              <Route exact path="/register" name="Register" render={props => <Register {...props}/>} />
              <Route exact path="/joining/:code" name="Meeting" render={props => <Joining {...props}/>} />
              <Route exact path="/" name="Website" render={props => <Website {...props}/> } />
              <Route path="/" name="Home" component={withAuth(Home)} />
            </Switch>
          </React.Suspense>
      </HashRouter>
    );
  }
}

export default App;
