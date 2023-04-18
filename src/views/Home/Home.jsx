import React, { Component, Suspense } from 'react';
//import * as router from 'react-router-dom';
import classNames from 'classnames';

import {
  CToast,
  CToaster,
  CToastHeader,
  CToastBody
} from '@coreui/react';

import { CFooter, CHeader } from '@coreui/react';
import DefaultContent from './../../containers/Layout/DefaultContent.jsx';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";


import ChangePassword from './components/ChangePassword';
import Profile from './components/Profile';
import ProfilePicture from './components/ProfilePicture';

var auth = require('./../../services/Auth');

export const Context = React.createContext({show: false});

const DefaultFooter = React.lazy(() => import('./../../containers/Layout/DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./../../containers/Layout/DefaultHeader'));

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Home extends Component {

  constructor(props) {
    super(props);

    this.notify.bind(this);
    this.updateTZ.bind(this);
    this.openProfile.bind(this);
    this.closeProfile.bind(this);
    this.openProfilePicture.bind(this);
    this.closeProfilePicture.bind(this);
    this.openChangePassword.bind(this);
    this.closeChangePassword.bind(this);

    this.state = {
      showChangePassword: false,
      showProfile: false,
      showProfilePicture: false,
      profilePictureUpdate: false,
      toasts: [],
      timezone: auth.getTimezone()
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    /*
    if (this.props.color !== nextProps.color) {
      return true;
    }

    if (this.state.isAsideOpen !== nextState.isAsideOpen) {
      return false;
    }*/
    return true;
  }

  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;

  notify = (type, msg) => {
    var state = this.state;
    state.toasts.push(
      { position: 'bottom-left',
        autohide: 4000,
        type: 'alert-' + type,
        title: 'General.labels.notification',
        body: msg
      }
    );
    this.setState(state);
  }

  updateTZ = (timezone) => {
    var state = this.state;
    auth.setTimezone(timezone);
    state.timezone = timezone;
    this.setState(state);
  }

  closeChangePassword() {
    this.setState({
      showChangePassword: false
    });
  }

  openChangePassword() {
    this.setState({
      showChangePassword: true
    });
  }

  closeProfile() {
    this.setState({
      showProfile: false
    });
  }

  openProfile() {
    this.setState({
      showProfile: true
    });
  }

  closeProfilePicture() {
    this.setState({
      showProfilePicture: false
    });
  }

  openProfilePicture() {
    this.setState({
      showProfilePicture: true
    });
  }

  updateProfilePicture() {
    this.setState({
      profilePictureUpdate: true
    });
  }

  render() {
    const {t} = this.props;
    const {toasts, timezone} = this.state;

    const classes = classNames('c-app c-default-layout');

    let toasters = (()=>{
      return toasts.reduce((toasters, toast) => {
        toasters[toast.position] = toasters[toast.position] || []
        toasters[toast.position].push(toast)
        return toasters
      }, {})
    })();

    return (
      <div className={classes}>

        <div className="c-wrapper">
          <CHeader  className="bg-gradient-light">
            <Suspense  fallback={this.loading()}>
              <DefaultHeader
                openProfile={this.openProfile.bind(this)}
                openChangePassword={this.openChangePassword.bind(this)}
                openProfilePicture={this.openProfilePicture.bind(this)}
                profilePictureUpdate={this.state.profilePictureUpdate}
                notify={this.notify}
              />
            </Suspense>
          </CHeader>
          <div className="c-body bg-white">
            <DefaultContent
              notify={this.notify}
              timezone={timezone}
            />
          </div>
          <CFooter fixed={false} className="bg-gradient-light">
            <Suspense fallback={this.loading()}>
              <DefaultFooter />
            </Suspense>
          </CFooter>

          <Profile
            show={this.state.showProfile}
            closeProfile={this.closeProfile.bind(this)}
            notify={this.notify}
            updateTZ={this.updateTZ}
          />

          <ChangePassword
            show={this.state.showChangePassword}
            closeChangePassword={this.closeChangePassword.bind(this)}
            notify={this.notify}
          />

          <ProfilePicture
            show={this.state.showProfilePicture}
            closeProfilePicture={this.closeProfilePicture.bind(this)}
            updateProfilePicture={this.updateProfilePicture.bind(this)}
            notify={this.notify}
          />
        </div>

        {Object.keys(toasters).map((toasterKey) => (
          <CToaster position={toasterKey} key={'toaster' + toasterKey}>
          {
              toasters[toasterKey].map((toast, key)=>{
                return(
                          <CToast
                            key={'toast' + key}
                            show={true}
                            autohide={toast.autohide}
                            fade={toast.fade}
                            className={toast.type}
                          >
                            <CToastHeader closeButton={toast.closeButton}>{t(toast.title)}</CToastHeader>
                            <CToastBody>{t(toast.body)}</CToastBody>
                          </CToast>
                )
              })
          }
          </CToaster>
        ))}

      </div>
    );
  }
}


Home.propTypes = propTypes;
Home.defaultProps = defaultProps;

export default withTranslation()(Home);
