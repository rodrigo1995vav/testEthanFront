import React, { Component, Suspense } from 'react';

import {
  CHeader,
  CCard, CCardGroup,CCardBody,
  CFooter,
} from '@coreui/react';

import socketIOClient from "socket.io-client";
import { withTranslation } from 'react-i18next';

import _ from 'lodash';
import Moment from 'moment';
import PropTypes from "prop-types";


import MeetingHeader from './../subComponents/MeetingHeader';
import MeetingLeftBar from './../subComponents/MeetingLeftBar';
import MeetingContent from './../subComponents/MeetingContent';
import MeetingFooter from './../subComponents/MeetingFooter';
import i18n from '../../../services/i18n';

var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Execution extends Component {
  constructor(props) {
    super(props);

    this.reconnect = this.reconnect.bind(this);
    this.disconnected = this.disconnected.bind(this);
    this.syncMeeting = this.syncMeeting.bind(this);

    this.updateParticipants = this.updateParticipants.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.newMessage = this.newMessage.bind(this);

    this.switchLeftBar = this.switchLeftBar.bind(this);
    this.setNotes = this.setNotes.bind(this);
    this.notesUpdated = this.notesUpdated.bind(this);

    this.state = {
      socket: null,
      attendees: {},
      participants: [],
      chat: [],
      questions: [],
      whiteboard: [],
      ideation: [],
      votes: [],
      project: {
        id: null,
        details: null,
        tasks: [],
        board: {
            columns: []
        },
        members: {}
      },
      settings: {
        chat: false,
        questions: false,
        docs: false,
        project: false
      },
      notes: "",
      language: i18n.language,
      leftBar: true,
    }

    this.lastMsg = React.createRef();
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

  resize = () => this.forceUpdate();

  componentDidMount() {
    var state = this.state;
    state.socket = socketIOClient(process.env.REACT_APP_API_URL,{
      path: '/joining',
      query: "code=" + this.props.meeting.code.replace(/-/g,'') + "&action=duringMeeting&token=" + auth.getToken(),
      credentials: process.env.REACT_APP_API_CREDENTIALS,
      mode: process.env.REACT_APP_API_MODE
    });
    state.socket.on("reconnect", () => this.reconnect());
    state.socket.on("disconnect", () => this.disconnected());
    state.socket.on("syncMeeting", (data) => this.syncMeeting(data));

    state.socket.on("updateParticipants", (data) => this.updateParticipants(data));

    state.socket.on("newMsg", (msg) => this.newMessage(msg));
    state.socket.on("newQuestion", (question) => this.newQuestion(question));

    state.attendees[this.props.meeting.userInfo[0].email] = {
      fullName: this.props.meeting.userInfo[0].fullName,
      initials: this.props.meeting.userInfo[0].initials,
      type: 'organizer',
      picture: _.isString(this.props.meeting.userInfo[0].picture) && this.props.meeting.userInfo[0].picture.length > 20 ? this.props.meeting.userInfo[0].picture : false
    }
    this.props.meeting.attendees.map(function(attendee){
      state.attendees[attendee.email] = {
        fullName: attendee.userInfo[0].fullName,
        initials: attendee.userInfo[0].initials,
        type: attendee.type,
        picture: _.isString(attendee.userInfo[0].picture) && attendee.userInfo[0].picture.length > 20 ? attendee.userInfo[0].picture : false
      };
      return true;
    });

    this.setState(state);
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  reconnect = () => {
    this.props.setAction("execution");
  }

  disconnected = () => {
    this.props.setAction("disconnected");
  }

  syncMeeting = (data) => {
    var state = this.state;
    var meeting = this.props.meeting;
    var meetingUpdated = false;

    Object.keys(data).forEach((k) => {
      var v = data[k];

      switch(k){
        case 'participants':
        case 'chat':
        case 'questions':
        case 'settings':
        case 'whiteboard':
        case 'ideation':
        case 'votes':
        case 'notes':
        case 'project':
            state[k] = v;
          break;
        case 'notifications':
          if(!_.isNull(v))
          {
            this.props.notify(v.type, 'Execution.msgs.' + v.msg);
          }
          break;
        case 'goals':
        case 'docs':
        case 'attendees':
          meeting[k] = v;
          meetingUpdated = true;
          if(k === "attendees"){
            state.attendees = {};
            state.attendees[this.props.meeting.userInfo[0].email] = {
              fullName: this.props.meeting.userInfo[0].fullName,
              initials: this.props.meeting.userInfo[0].initials,
              type: 'organizer',
              picture: _.isString(this.props.meeting.userInfo[0].picture) && this.props.meeting.userInfo[0].picture.length > 20 ? this.props.meeting.userInfo[0].picture : false
            }
            this.props.meeting.attendees.map(function(attendee){
              state.attendees[attendee.email] = {
                fullName: attendee.userInfo[0].fullName,
                initials: attendee.userInfo[0].initials,
                type: attendee.type,
                picture: _.isString(attendee.userInfo[0].picture) && attendee.userInfo[0].picture.length > 20 ? attendee.userInfo[0].picture : false
              };
              return true;
            });
          }
          break;
        default:

      }
    });
    if(meetingUpdated){
      this.props.setMeeting(meeting);
    }

    this.setState(state);
  }

  updateParticipants = (data) => {
    var state = this.state;
    var participants = data.participants;
    var diff;

    if(participants.length > state.participants.length)
    {
      diff = _.difference(participants, state.participants);
      if(diff[0] !== this.props.user.email && diff.length === 1)
      {
        diff[0] = state.attendees[diff[0]].fullName;
        this.props.notify("info","Execution.msgs.participant_joined", {var: diff[0]});
      }
    }

    if(participants.length < state.participants.length)
    {
      diff = _.difference(state.participants, participants);
      diff[0] = state.attendees[diff[0]].fullName;
      this.props.notify("info","Execution.msgs.participant_left", {var: diff[0]});
    }

    state.participants = data.participants;

    this.setState(state);
  }

  updateSettings = (name, value) => {
    var state = this.state;
    state.settings[name] = value;
    this.setState(state);
  }

  newMessage = (msg) => {
    var state = this.state;
    state.chat.push(msg);
    this.setState(state);
    /*this.lastMsg.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });*/
  }

  newQuestion = (question) => {
    var state = this.state;
    state.questions.push(question);
    this.setState(state);
  }

  switchLeftBar = () => {
    var state = this.state;
    state.leftBar = !state.leftBar;
    this.setState(state);
  }

  setNotes = (v) => {
    var state = this.state;
    state.notes = v;
    this.state.socket.emit("updateNotes", v, (res) => this.notesUpdated(res));
    this.setState(state);
  }

  notesUpdated = (res) => {
    if(res === "FAILED"){
      this.props.notify("danger", "Execution.msgs.sync_not_sent");
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;

  render() {
      const {meeting, user} = this.props;
      const {participants, chat, questions, settings, attendees, socket, whiteboard, ideation, votes, notes, project, leftBar} = this.state;

      return (
        <div className="c-wrapper">
            <CHeader className=" bg-gradient-light">
              <Suspense fallback={this.loading()} >
                <MeetingHeader
                  meeting={meeting}
                  user={user}
                  socket={socket}
                />
              </Suspense>
            </CHeader>

            <div className="c-body container-fluid justify-content-center bg-gradient-light overflow-auto">

                <CCardGroup>

                  <CCard className="pt-1 col-4 overflow-auto fade-in" style={{height: '87vh', display: leftBar ? 'block' : 'none'}}>
                    <CCardBody>
                      <MeetingLeftBar
                        meeting={meeting}
                        user={user}
                        participants={participants}
                        chat={chat}
                        questions={questions}
                        settings={settings}
                        attendees={attendees}
                        lastMsg={this.lastMsg}
                        socket={socket}
                        notes={notes}

                        notify={this.props.notify}
                        updateSettings={this.updateSettings}
                        setNotes={this.setNotes}
                        />
                    </CCardBody>
                  </CCard>

                  <CCard className={leftBar ?  "pt-1 col-8 overflow-auto" : "pt-1 col-12 overflow-auto"}    style={{height: '87vh'}}>
                    <CCardBody>

                    <MeetingContent
                        meeting={meeting}
                        user={user}
                        participants={participants}
                        attendees={attendees}
                        socket={socket}
                        leftBar={leftBar}
                        whiteboard={whiteboard}
                        ideation={ideation}
                        votes={votes}
                        project={project}
                        settings={settings}

                        switchLeftBar={this.switchLeftBar}
                        syncMeeting={this.syncMeeting}
                        notify={this.props.notify}
                        />

                    </CCardBody>
                  </CCard>
              </CCardGroup>
            </div>

            <CFooter fixed={false} className="bg-gradient-light">
              <Suspense fallback={this.loading()}>
                <MeetingFooter />
              </Suspense>
            </CFooter>
        </div>
    );
  }
}

Execution.propTypes = propTypes;
Execution.defaultProps = defaultProps;

export default withTranslation()(Execution);
