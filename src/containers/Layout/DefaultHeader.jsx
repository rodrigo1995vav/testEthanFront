import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CHeaderNav,
  CHeaderNavItem,
  CHeaderNavLink
  } from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

// routes config
import { withTranslation } from 'react-i18next';

import DefaultHeaderDropdown  from './DefaultHeaderDropdown'
import logo from '../../assets/img/logo/logo_transparent_large.png'

var auth = require('./../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
        role: auth.getValue("role")
    };
  }

  render() {
    const {role} = this.state;
    const {t, location} = this.props;

    return (
      <>
        <CHeaderNav className="mr-auto">
          <CHeaderNavItem className="px-1">
            <CIcon
              className="c-sidebar-brand-full"
              src={logo}
              height={45}
            />
          </CHeaderNavItem>
          <CHeaderNavItem className={location.pathname === '/dashboard' ? 'ml-5 mt-1 px-1 font-weight-bold' : 'ml-5 mt-1 px-1'} >
            <CHeaderNavLink to="/dashboard">{t("DefaultHeader.labels.home")}</CHeaderNavLink>
          </CHeaderNavItem>
          {role !== 'User' &&
          <>
            <CHeaderNavItem  className={location.pathname === '/users' ? 'ml-1 mt-1 px-1 font-weight-bold' : 'ml-1 mt-1 px-1'} >
              <CHeaderNavLink to="/users">{t("DefaultHeader.labels.users")}</CHeaderNavLink>
            </CHeaderNavItem>
          </>
          }
           <CHeaderNavItem className={location.pathname === '/meetings' ? 'ml-1 mt-1 px-1 font-weight-bold' : 'ml-1 mt-1 px-1'}  >
            <CHeaderNavLink to="/meetings">{t("DefaultHeader.labels.meetings")}</CHeaderNavLink>
          </CHeaderNavItem>
          {role !== 'User' &&
          <>
            <CHeaderNavItem className={location.pathname === '/projects' ? 'ml-1 mt-1 px-1 font-weight-bold' : 'ml-1 mt-1 px-1'} >
              <CHeaderNavLink to="/projects">{t("DefaultHeader.labels.projects")}</CHeaderNavLink>
            </CHeaderNavItem>
          </>
          }
          <CHeaderNavItem className={location.pathname === '/tasks' ? 'ml-1 mt-1 px-1 font-weight-bold' : 'ml-1 mt-1 px-1'}  >
            <CHeaderNavLink to="/tasks">{t("DefaultHeader.labels.tasks")}</CHeaderNavLink>
          </CHeaderNavItem>
        </CHeaderNav>

        <CHeaderNav>
          {/*<DefaultHeaderDropdown notif/>
          <DefaultHeaderDropdown tasks/>
          <DefaultHeaderDropdown mssgs/>*/}
          <DefaultHeaderDropdown accnt
            openChangePassword = {this.props.openChangePassword}
            openProfile = {this.props.openProfile}
            openProfilePicture = {this.props.openProfilePicture}
            profilePictureUpdate = {this.props.profilePictureUpdate}
            notify = {this.props.notify}
            />
        </CHeaderNav>

        {/*<CSubheader className="px-3 justify-content-between">
            <ul className="d-md-down-none mfe-2 c-subheader-nav">
              <li className="c-subheader-nav-link">
                <CLink href="#">
                  <CIcon name="cil-speech" alt="Settings" />
                </CLink>
              </li>
              <li className="c-subheader-nav-link">
                <CLink aria-current="page" href="#/dashboard">
                  <CIcon name="cil-graph" alt="Dashboard" /> TBD
                </CLink>
              </li>
              <li className="c-subheader-nav-link">
                <CLink href="#">
                  <CIcon name="cil-settings" alt="Settings" /> TBD
                </CLink>
              </li>
            </ul>
          {/*<CHeaderNav className="d-md-down-none mfe-2 c-subheader-nav">*/}
          {/*  <CHeaderNavItem className="c-subheader-nav-link">*/}
          {/*    <CIcon name="cil-speech" alt="Settings" />*/}
          {/*  </CHeaderNavItem>*/}
          {/*  <CHeaderNavItem to="/dashboard" className="c-subheader-nav-link">*/}
          {/*    <CIcon name="cil-graph" alt="Dashboard" /> Dashboard*/}
          {/*  </CHeaderNavItem>*/}
          {/*  <CHeaderNavItem className="c-subheader-nav-link">*/}
          {/*    <CIcon name="cil-settings" alt="Settings" /> Settings*/}
          {/*  </CHeaderNavItem>*/}
          {/*</CHeaderNav>}
        </CSubheader>*/}

      </>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(DefaultHeader));
