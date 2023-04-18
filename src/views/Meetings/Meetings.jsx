import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CLabel,
  CNav,CNavItem,CNavLink,
  CTabs,CTabContent,CTabPane
} from '@coreui/react';

import { withTranslation } from 'react-i18next';
import i18n from 'i18next';
import Moment from 'moment';
import PropTypes from "prop-types";
import _ from 'lodash';

import Meeting from './components/Meeting';
import Upcoming from './components/Upcoming';
import Previous from './components/Previous';
import Cancelled from './components/Cancelled';
import Objectives from './components/Objectives';
import Invitations from './components/Invitations';
import Communications from './components/Communications';

import {FaCalendarAlt} from 'react-icons/fa';

var auth = require('./../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Meetings extends Component {
  constructor(props) {
    super(props);

    this.fetchMeetings.bind(this);
    this.addMeeting.bind(this);
    this.closeMeeting.bind(this);
    this.editMeeting.bind(this);
    this.startMeeting.bind(this);
    this.cancelMeeting.bind(this);
    this.cancelMeetingConfirmed.bind(this);
    this.meetingObjectives.bind(this);
    this.sendInvitations.bind(this);
    this.closeInvitations.bind(this);
    this.showCommunications.bind(this);
    this.closeCommunications.bind(this);

    this.updateDates.bind(this);
    this.isOutsideRange.bind(this);

    this.state = {
      cancel: [],
      showMeeting: false,
      showMeetingObjectives: false,
      showCommunications: false,
      showInvitations: false,
      invitationType: 'confirmed',
      meeting: null,
      language: i18n.language,
      connectedUser: auth.getValue("email"),
      loading: true,
      upcomingMeetings: [],
      previousMeetings: [],
      cancelledMeetings: [],
      dates: {
        startDate: Moment().subtract(1, 'month'),
        endDate: Moment().subtract(1, 'day')
      },
      redirect: null
    }

    this.fetchMeetings( true, true, true);
  }

  static getDerivedStateFromProps(props, state) {
    if(props.i18n.language !== state.language)
    {
      state.language = props.i18n.language;
      Moment.locale(i18n.language !== "en" ? i18n.language : "en-gb");
      return state;
    }
    return null;
  }

  fetchMeetings = (upcoming, previous, cancelled) => {
    var state = this.state;

    state.dates.upcoming = upcoming;
    state.dates.previous = previous;
    state.dates.cancelled = cancelled;

    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_LIST), auth.getRequestInit('post', state.dates))
    .then(async res => {
      this.state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(this.state.status === 200)
      {
        if(state.dates.upcoming)
        {
          state.upcomingMeetings = data.upcoming;
        }
        if(state.dates.previous)
        {
          state.previousMeetings = data.previous;
        }
        if(state.dates.cancelled)
        {
          state.cancelledMeetings = data.cancelled;
        }
      }
      state.loading = false;
      this.setState({state});
    })
    .catch(err => {
    });
  }

  addMeeting = (event) => {
    this.setState({
      showMeeting: true
    });
  }

  closeMeeting = (event) => {
    this.setState({
      showMeeting: false,
      meeting: null
    })
  }

  editMeeting = (item) => {
    this.setState({
      showMeeting: true,
      meeting: item
    });
  }

  startMeeting = async (item) => {
    var res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_START) + item._id, auth.getRequestInit('get', null));
    if(res.status === 200)
    {
      var state = this.state;
      state.redirect = process.env.REACT_APP_JOINING_URL + item.code.replace(/-/g,'') + "?lng=" + i18n.language ;
      this.setState(state);
    }
  }

  cancelMeeting = (item, index) => {
    var state = this.state;
    const position = state.cancel.indexOf(index);
    (position !== -1) ? state.cancel.splice(position, 1) : state.cancel.push(index);
    this.setState(state);
  }

  cancelMeetingConfirmed = (item, index) => {
    var state = this.state;

    const position = state.cancel.indexOf(index);
    (position !== -1) ? state.cancel.splice(position, 1) : state.cancel.push(index);

    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_CANCEL) + item._id, auth.getRequestInit('delete', state.values))
    .then(async res => {
      state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(state.status === 200)
      {
        this.props.notify("success","Meetings.msgs.meeting_cancelled_successfully");
        this.fetchMeetings(true,false,true);
      }
    })
    .catch(err => {});
  }

  meetingObjectives = (item, index) => {
    var state = this.state;
    state.meeting = item;
    state.showMeetingObjectives = true;
    this.setState(state);
  }

  closeMeetingObjectives = (event) => {
    var state = this.state;
    state.showMeetingObjectives = false;
    this.setState(state);
  }

  sendInvitations = (item, type) => {
    var state = this.state;
    state.meeting = item;
    state.showInvitations = true;
    state.invitationType = type;
    this.setState(state);
  }

  closeInvitations = () => {
    var state = this.state;
    state.showInvitations = false;
    this.setState(state);
  }

  showCommunications = (item, type) => {
    var state = this.state;
    state.meeting = item;
    state.showCommunications = true;
    this.setState(state);
  }

  closeCommunications = () => {
    var state = this.state;
    state.showCommunications = false;
    this.setState(state);
  }

  updateDates = (dates) => {
    var state = this.state;
    state.dates = dates;
    this.setState(state);
  }

  isOutsideRange = (day) => {
    if(this.state.focusedInput === "endDate"){
        return day.isAfter(Moment(new Date()).subtract(1,'day')) || day.isBefore(this.state.dates.startDate);
    }
    if(this.state.focusedInput === "startDate"){
        return day.isAfter(Moment(new Date()).subtract(1,'day')) || day.isAfter(this.state.dates.endDate) || day.isBefore(Moment(new Date()).add(-1, 'years'));
    }
    return false;
  }

  render() {
    const {t, timezone} = this.props
    const {upcomingMeetings, previousMeetings, cancelledMeetings, loading, dates, redirect} = this.state;

    if(!_.isNull(redirect)){
      return <Redirect to={redirect} /> ;
    }

    return (
          <div className="animated fadeIn">
            <CCard>
              <CCardHeader className="font-weight-bold">
                <FaCalendarAlt className="mr-3" />
                <CLabel className="font-lg">{t("Meetings.titles.meetings")}</CLabel>
                <div className="card-header-actions">
                  <CButton block color="primary" shape="circle" size="sm" variant="outline" onClick={() => this.addMeeting()}>{t("Meetings.labels.new_meeting")}</CButton>
                </div>
              </CCardHeader>
              <CCardBody className="p-3">
                <CTabs fade={true}>
                  <CNav variant="tabs" className='nav-underline nav-underline-primary'>
                    <CNavItem>
                      <CNavLink>
                        {t("Meetings.titles.upcoming")}
                        <CBadge color="primary" className="ml-1">{upcomingMeetings.length}</CBadge>
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink>
                        {t("Meetings.titles.previous")}
                        <CBadge color="primary" className="ml-1">{previousMeetings.length}</CBadge>
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                    <CNavLink>
                        {t("Meetings.titles.cancelled")}
                        <CBadge color="primary" className="ml-1">{cancelledMeetings.length}</CBadge>
                      </CNavLink>
                    </CNavItem>
                  </CNav>
                  <CTabContent>
                    <CTabPane className="p-2">
                      <Upcoming
                        upcomingMeetings={upcomingMeetings}
                        loading={loading}
                        timezone={timezone}
                        cancel={this.state.cancel}
                        editMeeting={this.editMeeting}
                        startMeeting={this.startMeeting}
                        cancelMeeting={this.cancelMeeting}
                        cancelMeetingConfirmed={this.cancelMeetingConfirmed}
                        notify={this.props.notify}
                        sendInvitations={this.sendInvitations}
                        showCommunications={this.showCommunications}
                      />
                    </CTabPane>
                    <CTabPane className="p-2">
                      <Previous
                        previousMeetings={previousMeetings}
                        loading={loading}
                        timezone={timezone}
                        dates={dates}
                        editMeeting={this.editMeeting}
                        fetchMeetings={this.fetchMeetings}
                        meetingObjectives={this.meetingObjectives}
                        updateDates={this.updateDates}
                        notify={this.props.notify}
                        showCommunications={this.showCommunications}
                      />
                    </CTabPane>
                    <CTabPane className="p-2">
                    <Cancelled
                        cancelledMeetings={cancelledMeetings}
                        loading={loading}
                        timezone={timezone}
                        fetchMeetings={this.fetchMeetings}
                        notify={this.props.notify}
                        sendInvitations={this.sendInvitations}
                        showCommunications={this.showCommunications}
                      />
                    </CTabPane>
                  </CTabContent>
                </CTabs>
              </CCardBody>
            </CCard>
            <Meeting
                show={this.state.showMeeting}
                meeting={this.state.meeting}
                closeMeeting={this.closeMeeting}
                fetchMeetings={this.fetchMeetings}
                notify={this.props.notify}
                timezone={this.props.timezone}
              />
            <Objectives
                show={this.state.showMeetingObjectives}
                meeting={this.state.meeting}
                closeMeetingObjectives={this.closeMeetingObjectives}
                fetchMeetings={this.fetchMeetings}
                timezone={timezone}
                notify={this.props.notify}
              />
            <Invitations
                show={this.state.showInvitations}
                type={this.state.invitationType}
                meeting={this.state.meeting}
                closeInvitations={this.closeInvitations}
                timezone={timezone}
                connectedUser={this.state.connectedUser}
                notify={this.props.notify}
              />
              <Communications
                show={this.state.showCommunications}
                meeting={this.state.meeting}
                closeCommunications={this.closeCommunications}
                timezone={timezone}
                connectedUser={this.state.connectedUser}
                notify={this.props.notify}
              />
          </div>
    )
  }
}

Meetings.propTypes = propTypes;
Meetings.defaultProps = defaultProps;

export default withTranslation()(Meetings)
