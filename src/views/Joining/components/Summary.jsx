import React, { Component } from 'react';
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CImg,
  CRow,
  CListGroup,CListGroupItem,CListGroupItemText
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import socketIOClient from "socket.io-client";
import PropTypes from "prop-types";

import renderHTML from 'react-render-html';
import { withTranslation } from 'react-i18next';
import MomentTZ from 'moment-timezone';

import _ from 'lodash';

import Language from './../../Components/Language';

var auth = require('./../../../services/Auth');
var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Summary extends Component {
  constructor(props) {
    super(props);

    this.state={
      loading: true,
      status: "new",
      socket: null
    }
  }

  async componentDidMount () {
    var state = this.state;
    state.status = this.getStatus(this.props.meeting);
    state.loading = false;

    if(state.status === "started")
    {
      this.props.setAction("execution");
    }
    else
    {
      if(state.status.indexOf("timer_") === 0)
      {
        state.socket = socketIOClient(process.env.REACT_APP_API_URL,{
          path: '/joining',
          query: "code=" + this.props.meeting.code.replace(/-/g,'') + "&action=preMeeting&token=" + auth.getToken(),
          credentials: process.env.REACT_APP_API_CREDENTIALS,
          mode: process.env.REACT_APP_API_MODE
        });
        state.socket.on("updateStatus", (data) => this.updateStatus(data));
      }
    }

    this.setState(state);
  }

  updateStatus = (data) => {
    var state = this.state;

    if(_.isNull(data.meeting))
    {
      state.socket.disconnect();
      this.props.setAction("redirect");
    }
    else
    {
      this.props.setMeeting(data.meeting);
      if(data.meeting.status === "started")
      {
        state.socket.disconnect();
        this.props.setAction("execution");
      }
      else
      {
        state.status = this.getStatus(data.meeting);
        this.setState(state);
      }
    }
  }

  getStatus = (meeting) => {
    if(meeting.timeLeft < parseInt(process.env.REACT_APP_MEETING_STANDBY_MINS))
    {
        if(meeting.status === "new")
        {
          return (meeting.timeLeft > 0 ) ? "timer_wait" : "timer_new";
        }
    }
    return meeting.status;
  }

  render() {
      const { t, meeting} = this.props;
      const { loading, status } = this.state;

      return (
          <>
            <CRow className="content-center">
                <CImg
                src="/assets/img/logo/logo_transparent_large.png"
                width="150px"
                fluid
              />
              </CRow>
              <CRow className="justify-content-center">
                <CCol md="10">
                  <CCardGroup>
                    <CCard>
                      <CCardBody>
                        <CRow className="text-center align-self-center">
                          <CCol className="col-4 text-left">
                                    <CIcon name="cil-calendar" className="mr-1" size="sm"/>
                                    {MomentTZ(meeting.datetime).tz(meeting.userInfo[0].timezone).format('LL')}
                                    <small className="text-muted">{" (GMT" + MomentTZ.tz(meeting.userInfo[0].timezone).format('Z') + ")" }</small>
                                    <br/>
                                    <CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(meeting.datetime).tz(meeting.userInfo[0].timezone).format('LT')} - {MomentTZ(meeting.datetime).tz(meeting.userInfo[0].timezone).add(meeting.duration,"minutes").format('LT')}
                                    <small className="text-muted">{" (" + meetingsHelper.convertDuration(meeting.duration) + ")"}</small>
                                    <br/>
                                    <u>{t("Summary.labels.organizer")}:</u> <b>{meeting.userInfo[0].fullName}</b>
                          </CCol>
                          <CCol className="col-8">
                                {loading
                                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                                : <>
                                    <CAlert className={"alert-" + meetingsHelper.getMeetingClass(status) + " fade show text-center text-justify"} role="alert">
                                        {renderHTML(t("Summary.labels.status_" + status,
                                          {var: status === "new" ? process.env.REACT_APP_MEETING_STANDBY_MINS : Math.ceil(Math.abs(meeting.timeLeft))}))
                                        }
                                    </CAlert>
                                  </>
                                }
                          </CCol>
                        </CRow>
                        <hr/>
                        <CRow>
                          <CCol className="col-12">
                            <CRow>
                              <CCol className="col-6 border-right">
                                <CRow>
                                  <CCol className="col-12 text-center">
                                    <h4 className="pt-2">
                                        {meeting.subject}
                                    </h4>
                                    </CCol>
                                </CRow>
                                <CRow className="mb-1 text-justify font-italic">
                                  <CCol className="col-12 text-left">
                                    {meeting.description}
                                  </CCol>
                                </CRow>
                              </CCol>

                              <CCol className="col-6 text-muted text-center">
                                <h5><CIcon name="cil-speedometer" className="mr-2" />{t("Meetings.labels.agenda")}</h5>
                                <CListGroup className="list-group mt-1 text-left">
                                  {meeting.agenda.map((item,index) => (
                                    <CListGroupItem  className="border-0 p-0" key={"agenda-"+index}>
                                      <CListGroupItemText className="pl-2 border-0">
                                        {(index+1) + ". " + item.content}
                                        <CBadge color="info" className="ml-1">{meetingsHelper.convertDuration(item.duration)}</CBadge>
                                        </CListGroupItemText>
                                    </CListGroupItem>
                                  ))}
                                </CListGroup>
                              </CCol>
                            </CRow>
                            <hr/>
                            <CRow className="mb-1">
                              <CCol className="col-6 text-muted text-center border-right">
                                <h5><CIcon name="cil-task" className="mr-2" />{t("Meetings.labels.goals")}</h5>
                                <CListGroup className="list-group text-left mt-1">
                                  {meeting.goals.map((item,index) => (
                                    <CListGroupItem  className="border-0 p-0" key={"goal-"+index}>
                                      <CListGroupItemText className="pl-2 border-0">
                                        {(index+1) + ". " + item.item}
                                        <CBadge color={meetingsHelper.getGoalClass(item.priority)} className="ml-1">{t("Goals.labels." + item.priority)}</CBadge>
                                      </CListGroupItemText>
                                    </CListGroupItem>
                                  ))
                                  }
                                </CListGroup>
                              </CCol>
                              <CCol className="col-6 text-muted text-center">
                                <h5><CIcon name="cil-people" className="mr-2" />{t("Meetings.labels.attendees")}</h5>
                                <CListGroup className="list-group text-left mt-1">
                                  {meeting.attendees.map((item,index) => (
                                    <CListGroupItem  className="border-0 p-0" key={"attendee-"+index}>
                                    <CListGroupItemText  className="pl-2 border-0">
                                      {(index+1) + ". " + item.email}
                                      <CBadge color={meetingsHelper.getRequiredClass(item.presence)} className="ml-1">{t("Attendees.labels." + item.presence)}</CBadge>
                                      {item.type === "coHost" &&
                                        <CBadge color={meetingsHelper.getAttendeeClass(item.type)} className="ml-1">{t("Attendees.labels." + item.type)}</CBadge>
                                      }
                                    </CListGroupItemText>
                                  </CListGroupItem>
                                  ))
                                  }
                                </CListGroup>
                              </CCol>
                            </CRow>
                          </CCol>
                        </CRow>
                      </CCardBody>
                    </CCard>
                  </CCardGroup>
                </CCol>
              </CRow>
              <CRow className="content-center">
                <Language />
              </CRow>
            </>
    );
  }
}

Summary.propTypes = propTypes;
Summary.defaultProps = defaultProps;

export default withTranslation()(Summary);
