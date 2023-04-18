import React, { Component, Suspense } from 'react';

import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CNavItem,
  CProgress,
  CSidebarMinimizer
} from '@coreui/react';

import { CIcon } from '@coreui/icons-react';

//logo
import logo from '../../assets/img/logo/logo_transparent_large.png'
import sygnet from '../../assets/img/logo/logo_transparent_large.png'

// sidebar nav config
import navigation from '../../_nav';

class DefaultSidebar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      minimize: props.sidebarMinimize,
    };
    this.lastSidebarMinimize = props.sidebarMinimize;
  }

  render() {

    const {
      sidebarShow,
      sidebarMinimize,
      onChange,
    } = this.props;

    if (sidebarMinimize!==this.lastSidebarMinimize){
      this.setState({minimize: sidebarMinimize});
      this.lastSidebarMinimize = sidebarMinimize;
    }

    return (
      <CSidebar
        show={sidebarShow}
        unfoldable
        minimize={this.state.minimize}
        onShowChange={onChange}
        dropdownMode="closeInactive"
      >
        <CSidebarBrand className="d-md-down-none bg-light" to="/">
          <CIcon
            className="c-sidebar-brand-full"
            src={logo}
            height={45}
          />
          <CIcon
            className="c-sidebar-brand-minimized"
            src={sygnet}
            height={45}
          />
        </CSidebarBrand>
        <Suspense>
          <CSidebarNav>

            <CCreateElement items={navigation}/>

            <CSidebarNavDivider />
            <CSidebarNavTitle>System Utilization</CSidebarNavTitle>
            <CNavItem className="px-3 d-compact-none c-d-minimized-none">
              <div className="text-uppercase mb-1"><small><b>CPU Usage</b></small></div>
              <CProgress size="xs" value={25} color="info" />
              <small className="text-muted">348 Processes. 1/4 Cores.</small>
            </CNavItem>
            <CNavItem className="px-3 d-compact-none c-d-minimized-none">
              <div className="text-uppercase mb-1"><small><b>Memory Usage</b></small></div>
              <CProgress size="xs" value={70} color="warning" />
              <small className="text-muted">11444GB/16384MB</small>
            </CNavItem>
            <CNavItem className="px-3 mb-3 d-compact-none c-d-minimized-none">
              <div className="text-uppercase mb-1"><small><b>SSD 1 Usage</b></small></div>
              <CProgress size="xs" value={95} color="danger" />
              <small className="text-muted">243GB/256GB</small>
            </CNavItem>
          </CSidebarNav>
        </Suspense>
        <CSidebarMinimizer className="c-d-md-down-none"/>
      </CSidebar>
    );
  }
}

export default DefaultSidebar;
