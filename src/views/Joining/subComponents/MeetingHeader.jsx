import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CHeaderNav,
  CHeaderNavItem,
  CImg
  } from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';
import logo from './../../../assets/img/logo/logo_transparent_large.png'
import MomentTZ from 'moment-timezone';

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class MeetingHeader extends Component {
  constructor(props){
    super(props);

    this.endMeeting = this.endMeeting.bind(this);
  }

  endMeeting = (e) => {
    this.props.socket.emit('endMeeting', true , (res) => this.confirmation(res));
  }

  confirmation = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.sync_not_sent");
    }
  }

  render() {
    const {meeting, user, t} = this.props;

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

          <CHeaderNavItem className="ml-5 mt-1 pl-5 font-2xl border-left" >
            {meeting.subject}
          </CHeaderNavItem>

        </CHeaderNav>
        <CHeaderNav>
          {user.email === meeting.userInfo[0].email &&
            <CHeaderNavItem className="mt-1 pl-3 pr-3 border-left">
              <CButton color="danger" onClick={() => this.endMeeting()}>{t("General.buttons.end_meeting")}</CButton>
            </CHeaderNavItem>
          }
          <CHeaderNavItem className="mt-1 pl-3 pr-3 mr-3 border-left border-right">
            <CIcon name="cil-calendar" className="mr-1" size="sm"/>
            {MomentTZ(meeting.datetime).tz(meeting.userInfo[0].timezone).format('LL')}
            <small className="text-muted">{" (GMT" + MomentTZ.tz(meeting.userInfo[0].timezone).format('Z') + ")" }</small>
            <br/>
            <CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(meeting.datetime).tz(meeting.userInfo[0].timezone).format('LT')} - {MomentTZ(meeting.datetime).tz(meeting.userInfo[0].timezone).add(meeting.duration,"minutes").format('LT')}
            <small className="text-muted">{" (" + meetingsHelper.convertDuration(meeting.duration) + ")"}</small>
          </CHeaderNavItem>

            <div className="c-avatar text-center bg-gradient-dark text-light">
              {user.picture
                ? <CImg
                  src={user.picture}
                  className="c-avatar-img"
                  alt={user.email}
                 />
                 : user.initials
              }
            </div>
        </CHeaderNav>
      </>
    );
  }
}

MeetingHeader.propTypes = propTypes;
MeetingHeader.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(MeetingHeader));
