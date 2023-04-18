import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CAlert,
  CBadge,
  CButton,
  CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem,
  CImg,
  CInputGroup,
  CListGroup, CListGroupItem,
  CNav, CNavLink, CNavItem,
  CProgress,
  CSwitch,
  CTabs, CTabContent, CTabPane,
  CSelect,
  CTextarea
  } from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

//Text Editor
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

import { withTranslation } from 'react-i18next';

import _ from 'lodash';
import MomentTZ from 'moment-timezone';
import renderHTML from 'react-render-html';

import { FaHandPointer } from 'react-icons/fa';

import Objectives from './Objectives';
import Docs from './Docs';
import Participant from './Participant';
import Question from './Question';

const nl2br = require('react-nl2br');

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class MeetingLeftBar extends Component {
  constructor(props){
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);

    this.getAgendaClass = this.getAgendaClass.bind(this);
    this.runAgenda = this.runAgenda.bind(this);

    this.send = this.send.bind(this);
    this.reply = this.reply.bind(this);
    this.sentConfirmation = this.sentConfirmation.bind(this);

    this.applySettings = this.applySettings.bind(this);

    this.handleInputModal = this.handleInputModal.bind(this);

    this.additionalParticipant = this.additionalParticipant.bind(this);

    this.showMeetingObjective = this.showMeetingObjective.bind(this);
    this.closeMeetingObjective = this.closeMeetingObjective.bind(this);
    this.additionalObjective = this.additionalObjective.bind(this);

    this.closeMeetingDoc = this.closeMeetingDoc.bind(this);
    this.additionalDoc = this.additionalDoc.bind(this);
    this.setMeetingDocModalState = this.setMeetingDocModalState.bind(this);

    this.state = {
      meetingTimer: null,

      agenda: {
        timeLeft: this.props.meeting.timeLeft,
        timeConsumed: 0,
        index: 0
      },

      showAdditionalParticipant: false,

      showMeetingObjective: false,
      meetingObjective: null,
      meetingObjectiveModalState: false,

      showMeetingDoc: false,
      meetingDoc: null,
      meetingDocModalState: false,

      showReply: false,
      question: null,

      values: {
        msg: "",
        question: ""
      },

      filters: {
        questions: "all"
      }
    }

    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'size': ['small', false, 'large'] }],          // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'align': [] }]
      ]
    };
  }

  componentDidMount = () => {
    this.runAgenda(true);
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    this.setState(state);
  }

  getAgendaClass = (agendaIndex, index) => {
    if(agendaIndex === index)
    {
      return "p-2 bg-gradient-silver";
    }
    else
    {
      return (index < agendaIndex ? "p-2 bg-gradient-light" : "p-2");
    }
  }

  runAgenda = (first) => {
    var state = this.state;
    var agenda = this.props.meeting.agenda;
    state.agenda.index = -1;

    var now = new Date();
    state.meetingTimer = setTimeout(() => this.runAgenda(false),(60 - now.getSeconds()) * 1000);

    if(!first)
    {
      state.agenda.timeLeft--;
    }

    if(state.agenda.timeLeft <= 0)
    {
      state.agenda.timeConsumed = -state.agenda.timeLeft;
      var total=0;
      for(var i=0; i < agenda.length; i++)
      {
        total += parseInt(agenda[i].duration);
        if(state.agenda.timeConsumed <= total && state.agenda.index === -1)
        {
          state.agenda.index = (state.agenda.timeConsumed === total) ? i+1 : i;
        }
      }
      if(state.agenda.timeConsumed >= total){
        state.agenda.index = 100;
      }
    }
    this.setState(state);
  }

  send = (field) => {
    var action = "";
    switch(field){
      case "msg": action = "newMsg"; break;
      case "question": action = "newQuestion"; break;
      default:
        return true;
    }
    this.props.socket.emit(action, this.state.values[field], (res) => this.sentConfirmation(field, res));
  }

  reply = (question, show) => {
    var state = this.state;
    state.showReply = show;
    state.question = question;
    this.setState(state);
  }

  updateQuestionsFilter = (event) => {
    var state = this.state;
    const { value, name} = event.target;
    state.filters[name] = value;
    this.setState(state);
  }

  sentConfirmation = (label, res) => {
    var state = this.state;
    if(res === "FAILED")
    {
        this.props.notify("danger","Execution.msgs." + label + "_not_sent");
    }
    else
    {
      state.values[label] = "";
      this.setState(state);
    }
  }

  applySettings = () => {
    this.props.socket.emit("updateSettings", this.props.settings, (res) => this.settingsUpdated(res));
  }

  settingsUpdated = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.settings_not_updated");
    }
    else
    {
      this.props.notify("success","Execution.msgs.settings_updated_successfully");
    }
  }


  handleInputModal = (modal, e) => {
    var state = this.state;
    const {name, value} = e.target;
    state[modal][name] = value;
    this.setState(state);
  }

  additionalParticipant = (status) => {
    var state = this.state;
    state.showAdditionalParticipant = status;
    this.setState(state);
  }

  showMeetingObjective = (item) => {
    var state = this.state;
    state.meetingObjective = _.clone(item);
    state.showMeetingObjective = true;
    state.meetingObjectiveModalState = item.additional ? true : false;
    this.setState(state);
  }

  closeMeetingObjective = () => {
    var state = this.state;
    state.meetingObjective = null;
    state.showMeetingObjective = false;
    this.setState(state);
  }

  additionalObjective = () => {
    var state = this.state;
    state.meetingObjective = null;
    state.meetingObjective = {
      additional: true,
      completed: 0,
      priority: 'p1',
      item: ''
    };
    state.showMeetingObjective = true;
    state.meetingObjectiveModalState = true;
    this.setState(state);
  }

  showMeetingDoc = (item) => {
    var state = this.state;
    state.meetingDoc = _.clone(item);
    state.showMeetingDoc = true;
    state.meetingDocModalState = item.type === "link" ? 'from_url' : 'from_file_add';
    this.setState(state);
  }

  closeMeetingDoc = () => {
    var state = this.state;
    state.meetingDoc = null;
    state.showMeetingDoc = false;
    state.meetingDocModalState = null;
    this.setState(state);
  }

  additionalDoc = (window) => {
    var state = this.state;
    state.meetingDoc = null;
    state.meetingDoc = {
      additional: true,
      url: "https://",
      name: "",
      type: window === "from_url" ? "link" : "",
    };
    state.showMeetingDoc = true;
    state.meetingDocModalState = window;
    this.setState(state);
  }

  setMeetingDocModalState = (window, data) => {
    var state = this.state;
    state.meetingDocModalState = window;
    if(!_.isNull(data))
    {
      state.meetingDoc = {
        additional: true,
        url: data.url,
        name: data.name,
        type: data.type
      }
    }
    this.setState(state);
  }

  render() {
    const {lastMsg, t, meeting, user, participants, chat, questions, settings, attendees, notes} = this.props;
    const {agenda, values, filters} = this.state;

    return (
      <>
        <CTabs>
          <CNav variant='tabs' className='nav-underline nav-underline-primary'>
            <CNavItem>
              <CNavLink>
                <CIcon name="cil-home"/>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                <CIcon name="cil-people"/>
                <CBadge color="success" className="ml-1">{participants.length}</CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
              <CIcon name="cil-speech"/>
              {chat.length !== 0 &&
                <CBadge color="info" className="ml-1">{chat.length}</CBadge>
              }
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                ?
                {questions.length !== 0 &&
                  <CBadge color="info" className="ml-1">{questions.length}</CBadge>
                }
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                <CIcon name="cil-file"/>
                {/*meeting.docs.length !== 0 &&
                  <CBadge color="info" className="ml-1">{meeting.docs.length}</CBadge>
                */}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                <CIcon name="cil-pencil"/>
              </CNavLink>
            </CNavItem>

            {!_.isEmpty(attendees) && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
            <CNavItem>
              <CNavLink>
                <CIcon name="cil-settings"/>
              </CNavLink>
            </CNavItem>
            }
          </CNav>

          <CTabContent>

            {/**HOME (AGENDA + OBJECTIVES) */}
            <CTabPane className="pt-3 text-center">
                <h5><CIcon name="cil-speedometer" className="mr-2" />{t("Meetings.labels.agenda")}</h5>
                <hr/>
                <CProgress value={ (agenda.timeConsumed/meeting.duration*100) > 100 ? 100 : (agenda.timeConsumed/meeting.duration*100)} color="info" showPercentage precision={0} className="mb-3" />
                <hr/>
                <CListGroup accent className="mt-1 text-left">
                    {meeting.agenda.map((item,index) => (
                        <CListGroupItem className={this.getAgendaClass(agenda.index, index)} key={"agenda-"+index} accent={index === agenda.index ? "warning" : "info"} >
                          {(index+1) + ". " + item.content}
                          <CBadge color="info" className="ml-1">{meetingsHelper.convertDuration(item.duration)}</CBadge>
                        </CListGroupItem>
                    ))}
                </CListGroup>
                <hr/>
                <h5><CIcon name="cil-task" className="mr-2" />{t("Meetings.labels.goals")}</h5>
                <hr/>
                <CListGroup accent className="mt-1 text-left">
                    {meeting.goals.map((item,index) => (
                        <CListGroupItem key={"goal-"+index} accent={meetingsHelper.getGoalClass(item.priority)}>
                          {!_.isEmpty(attendees) && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost")
                          ?<CButton color="info" className="float-right" size="sm" onClick={() => this.showMeetingObjective(item)} >{item.completed}%</CButton>
                          :<CBadge color="info" className="float-right mt-1" size="sm" >{item.completed}%</CBadge>
                          }
                          {(index+1) + ". " + item.item}
                          {item.additional &&
                            <>
                              <CBadge color="light" className="mr-1" size="sm">{t("Objectives.labels.new")}</CBadge>
                            </>
                          }
                          {/*<CBadge color={meetingsHelper.getGoalClass(item.priority)} className="ml-1">{t("Goals.labels." + item.priority)}</CBadge>*/}
                      </CListGroupItem>
                    ))}
                    {!_.isEmpty(attendees) && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
                      <CListGroupItem key="goal-new" className="text-center border-left-0">
                        <CButton color="primary" size="sm" variant="outline" onClick={() => this.additionalObjective()}>{t("Execution.buttons.additional_objective")}</CButton>
                      </CListGroupItem>
                    }
                </CListGroup>
            </CTabPane>

            {/**PARTICIPANTS */}
            <CTabPane className="pt-3 text-center">
                <h5><CIcon name="cil-people" className="mr-2" />{t("Meetings.labels.attendees")}</h5>
                <hr/>
                <CListGroup accent className="mt-1 text-left">
                  <CListGroupItem  className="p-1 align-middle" key={"organizer"}  accent={participants.indexOf(meeting.userInfo[0].email) < 0 ? "dark" : "success" }>
                        <div className="c-avatar float-md-right mr-2 text-center bg-gradient-dark text-light">
                          { meeting.userInfo[0].picture
                          ? <CImg
                            className="c-avatar-img"
                            src={process.env.REACT_APP_AVATAR_URL + meeting.userInfo[0].picture}
                            alt={meeting.userInfo[0].email}
                            />
                          : meeting.userInfo[0].initials
                          }
                          <CBadge color={participants.indexOf(meeting.userInfo[0].email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                        </div>
                        <span className="float-md-left">
                          {meeting.userInfo[0].fullName}
                          <CBadge color={meetingsHelper.getAttendeeClass("organizer")} className="ml-1">{t("Attendees.labels.organizer")}</CBadge>
                        </span>
                  </CListGroupItem>
                  {meeting.attendees.map((item,index) => (
                    <CListGroupItem  className="p-1" key={"attendee-"+index}  accent={participants.indexOf(item.email) < 0 ? "dark" : "success" }>
                        <div className="c-avatar float-md-right mr-2 text-center bg-gradient-dark text-light">
                          {item.userInfo[0].picture
                          ? <CImg
                            className="c-avatar-img"
                            src={process.env.REACT_APP_AVATAR_URL + item.userInfo[0].picture}
                            alt={item.email}
                            />
                          : item.userInfo[0].initials
                          }
                          <CBadge color={participants.indexOf(item.email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                        </div>
                        <span className="float-md-left">
                          {item.fullName}
                          <CBadge color={meetingsHelper.getAttendeeClass(item.type)} className="ml-1">{t("Attendees.labels." + item.type)}</CBadge>
                        </span>
                    </CListGroupItem>
                    ))
                  }
                  {!_.isEmpty(attendees) && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
                    <CListGroupItem key="attendee-new" className="text-center border-left-0">
                        <CButton color="primary" size="sm" variant="outline" onClick={() => this.additionalParticipant(true)}>{t("Execution.buttons.additional_participant")}</CButton>
                    </CListGroupItem>
                  }
                </CListGroup>
            </CTabPane>

            {/**CHAT */}
            <CTabPane className="pt-3 text-center">
                <h5><CIcon name="cil-speech" className="mr-2" />{t("Execution.titles.chat")}</h5>
                <hr/>
                <div className="overflow-auto p-1 text-left" style={{height: '58vh'}}>
                  {chat.map((item, index) => (
                    <div key={"chat-"+index} ref={ (chat.length-1) === index ? lastMsg : null}>
                      <div className="message mr-1">
                        <div className={item.email !== user.email ? "ml-3 float-right" : "mr-3 float-left"}>
                          <div className="c-avatar text-center bg-gradient-dark text-light">
                            {attendees[item.email].picture
                            ? <CImg
                              className="c-avatar-img"
                              src={process.env.REACT_APP_AVATAR_URL + attendees[item.email].picture}
                              alt={item.email}
                              />
                            : attendees[item.email].initials
                            }
                            <CBadge color={participants.indexOf(item.email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                          </div>
                        </div>
                        <div>
                          {item.email !== user.email
                          ?
                          <>
                            <small className="text-muted">{MomentTZ(item.datetime).tz(user.timezone).format('LT')}</small>
                            <small className="text-muted float-right mt-1">{attendees[item.email].fullName}</small>
                          </>
                          :
                          <>
                            <small className="text-muted">{attendees[item.email].fullName}</small>
                            <small className="text-muted float-right mt-1">{MomentTZ(item.datetime).tz(user.timezone).format('LT')}</small>
                          </>
                          }
                        </div>
                        <small className="text-muted">{nl2br(item.msg)}</small>
                      </div>
                      {chat.length-1 !== index &&
                        <hr/>
                      }
                    </div>
                    ))}
                </div>
                {!_.isEmpty(attendees) && (!settings.chat || attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost")
                ?
                <div className="overflow-auto text-left text-primary" style={{height: '10vh'}}>
                  <hr/>
                  <CInputGroup>
                      <CTextarea
                        type="text"
                        name="msg"
                        placeholder={t("Execution.labels.msg")}
                        value={values.msg}
                        autoComplete="off"
                        className="col-10 border-silver"
                        size="sm"
                        onChange={this.handleInputChange}
                      />
                      <CButton color="dark" variant="outline" onClick={() => this.send("msg")} disabled={values.msg.match(/[A-Z0-9a-z]/) ? false : true} className="col-2 ml-1">
                        <CIcon name="cil-share" size="xl" />
                      </CButton>
                  </CInputGroup>
                </div>
                : <CAlert className="alert-info">{t("Execution.labels.chat_disabled")}</CAlert>
                }
            </CTabPane>

            {/**QUESTIONS */}
            <CTabPane className="pt-3 text-center">
                <h5><span className="mr-2">?</span>{t("Execution.titles.questions")}</h5>
                <hr/>
                <div className="text-center text-primary">
                  {t("Execution.labels.display")} :
                  <CButton className="m-1" size="sm" variant={filters.questions === "all" ? "outline" : ""} disabled={filters.questions === "all" ? true : false} color="primary" name="questions" value="all" onClick={this.updateQuestionsFilter}>
                    {t("Execution.labels.all")}
                  </CButton>

                  <CButton className="m-1" size="sm" variant={filters.questions === "answered" ? "outline" : ""} disabled={filters.questions === "answered" ? true : false} color="primary" name="questions" value="answered" onClick={this.updateQuestionsFilter}>
                    {t("Execution.labels.answered")}
                  </CButton>

                  <CButton className="m-1" size="sm" variant={filters.questions === "unanswered" ? "outline" : ""} disabled={filters.questions === "unanswered" ? true : false} color="primary" name="questions" value="unanswered" onClick={this.updateQuestionsFilter}>
                    {t("Execution.labels.unanswered")}
                  </CButton>
                </div>
                <hr/>
                <div className="overflow-auto p-1 text-left" style={{height: '49vh'}}>
                  {questions.map((item, index) => (
                    <div key={"block-question-"+index}>
                    { (filters.questions === "all" || (filters.questions === "answered" && item.answers.length > 0) || (filters.questions === "unanswered" && item.answers.length === 0) ) &&
                      <div key={"question-"+index} className={item.email !== user.email ? "" : ""}>
                        <div className="message">
                          <div className="mr-3 float-left">
                            <div className="c-avatar text-center bg-gradient-dark text-light">
                              {attendees[item.email].picture
                              ? <CImg
                                className="c-avatar-img"
                                src={process.env.REACT_APP_AVATAR_URL + attendees[item.email].picture}
                                alt={item.email}
                                />
                              : attendees[item.email].initials
                              }
                              <CBadge color={participants.indexOf(item.email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                            </div>
                          </div>
                          <div>
                          <small className="text-muted">{attendees[item.email].fullName}</small>
                          <small className="text-muted float-right mt-1">{MomentTZ(item.datetime).tz(user.timezone).format('LT')}</small>
                          </div>
                          <small className="text-muted">{nl2br(item.question)}</small>
                          {item.answers.length === 0 && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
                            <CButton size="sm" className="mt-1 float-right" color="dark" variant="outline" onClick={() => this.reply(item, true)}>{t("Execution.labels.reply")} </CButton>
                          }
                        </div>
                        {item.answers.length !== 0 &&
                            <hr size="sm" style={{width: "50%"}} />
                          }
                        {item.answers.map((subItem, index) => (
                          <div key={"qAnswer-"+index}>
                            <div className="message mt-1">
                              <div className="ml-3 float-right">
                                <div className="c-avatar text-center bg-gradient-dark text-light">
                                  {attendees[subItem.email].picture
                                  ? <CImg
                                    className="c-avatar-img"
                                    src={process.env.REACT_APP_AVATAR_URL + attendees[subItem.email].picture}
                                    alt={subItem.email}
                                    />
                                  : attendees[subItem.email].initials
                                  }
                                  <CBadge color={participants.indexOf(subItem.email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                                </div>
                              </div>
                              <div>
                              <small className="text-muted">{MomentTZ(item.datetime).tz(user.timezone).format('LT')}</small>
                              <small className="text-muted float-right mt-1">{attendees[subItem.email].fullName}</small>
                              </div>
                              <small className="text-muted">{nl2br(subItem.answer)}</small>
                            </div>
                            {(item.answers.length-1) === index && item.answers.length !== 0 && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
                            <div className="text-center mt-1">
                              <CButton size="sm" color="dark" variant="outline" onClick={() => this.reply(item, true)}>{t("Execution.labels.additional_reply")} </CButton>
                            </div>
                            }
                          </div>
                        ))}

                        {questions.length-1 !== index &&
                          <hr/>
                        }
                      </div>
                    }
                    </div>
                  ))}
                </div>
                {!_.isEmpty(attendees) && (!settings.questions || attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost")
                ?
                <div className="overflow-auto text-left text-primary" style={{height: '10vh'}}>
                  <hr/>
                  <CInputGroup>
                      <CTextarea
                        type="text"
                        name="question"
                        placeholder={t("Execution.labels.questions")}
                        value={values.question}
                        autoComplete="off"
                        className="col-10 border-silver"
                        size="sm"
                        onChange={this.handleInputChange}
                      />
                      <CButton color="dark" variant="outline" size="sm" onClick={() => this.send("question")} disabled={values.question.match(/[A-Z0-9a-z]/) ? false : true} className="col-2 ml-1">
                        <CIcon name="cil-share" />
                      </CButton>
                  </CInputGroup>
                </div>
                : <CAlert className="alert-info">{t("Execution.labels.questions_disabled")}</CAlert>
                }
            </CTabPane>

            {/**DOCUMENTS */}
            <CTabPane className="pt-3 text-center">
                <h5><CIcon name="cil-file" className="mr-2" />{t("Meetings.labels.documents")}</h5>
                {meeting.docs.length > 0 &&
                  <hr/>
                }
                <CListGroup className="mr-1 text-left" accent>
                  {meeting.docs.map((item,index) => (
                      <CListGroupItem  className="p-1 pl-3 align-middle" key={"doc-"+index} accent={item.type === "link" ? "info" : "dark"}>
                            {!_.isEmpty(attendees) && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
                              <CButton color="primary" variant="outline" className="float-right" size="sm" onClick={() => this.showMeetingDoc(item)} >
                                <CIcon name="cil-options" size="sm" />
                              </CButton>
                            }
                            {(index+1) + ". "}
                            <a href={item.type === "link" ? item.url : process.env.REACT_APP_DOCS_URL + item.url} target="_blank" rel='noreferrer noopener'>
                              {item.name}
                            </a>
                            {item.additional && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
                            <>
                              <CBadge color="light" className="ml-1" size="sm">{t("Objectives.labels.new")}</CBadge>
                            </>
                            }
                      </CListGroupItem>
                  ))}
                </CListGroup>
                <hr/>
                {!_.isEmpty(attendees) && (!settings.docs || attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost")
                ? <CDropdown className="m-1 btn-group">
                    <CDropdownToggle color="primary" size="sm" variant="outline">
                      {t("Execution.buttons.additional_document")}
                    </CDropdownToggle>
                    <CDropdownMenu placement="bottom">
                        <CDropdownItem onClick={()=>{this.additionalDoc("from_url")}}>{t("Docs.buttons.from_url")}</CDropdownItem>
                        <CDropdownItem onClick={()=>{this.additionalDoc("from_file")}}>{t("Docs.buttons.from_file")}</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                : <CAlert className="alert-info">{t("Execution.labels.docs_disabled")}</CAlert>
                }
            </CTabPane>

            {/**NOTES */}
            <CTabPane className="pt-3 text-center">
              <h5><CIcon name="cil-pencil" className="mr-2" />{t("Meeting.labels.notes")}</h5>
              <hr/>
              <ReactQuill
                  style={{height: '58vh'}}
                  modules={this.modules}
                  theme="snow"
                  value={notes}
                  onChange={(value) => this.props.setNotes(value)}
              />
            </CTabPane>


            {/**SETTINGS */}
            {!_.isEmpty(attendees) && (attendees[user.email].type === "organizer" || attendees[user.email].type === "coHost") &&
            <CTabPane className="pt-3 text-center">
              <h5><CIcon name="cil-settings" className="mr-2" />{t("Execution.labels.settings")}</h5>
              <hr/>
              <div className="text-left">
                <div className="clearfix mt-4"><FaHandPointer className="mr-1" /><small><b>{t("Execution.labels.option_whiteboard_owner")}</b></small>
                <CSelect
                          onChange={(e) => this.props.updateSettings('whiteboard', e.target.value)}
                          value = {settings.whiteboard}
                          custom
                          size="sm"
                          className="col-8 float-right"
                          >
                    <option value={meeting.userInfo[0].email} disabled={participants.indexOf(meeting.userInfo[0].email) < 0 ? true : false } >
                          {meeting.userInfo[0].fullName + " (" + t("Attendees.labels.organizer")+")"}
                    </option>
                    {meeting.attendees.map((item,index) => (
                    <option  key={"ideationOption-"+index} value={item.email}  disabled={participants.indexOf(item.email) < 0 ? true : false }>
                          {item.fullName + " ("+ t("Attendees.labels." + item.type)+")"}
                    </option>
                    ))
                  }
                </CSelect>
                </div>
              </div>
              <div className="text-left">
                <div className="clearfix mt-4"><FaHandPointer className="mr-1" /><small><b>{t("Execution.labels.option_ideation_owner")}</b></small>
                <CSelect
                          onChange={(e) => this.props.updateSettings('ideation', e.target.value)}
                          value = {settings.ideation}
                          custom
                          size="sm"
                          className="col-8 float-right"
                          >
                    <option value={meeting.userInfo[0].email} disabled={participants.indexOf(meeting.userInfo[0].email) < 0 ? true : false } >
                          {meeting.userInfo[0].fullName + " (" + t("Attendees.labels.organizer")+")"}
                    </option>
                    {meeting.attendees.map((item,index) => (
                    <option  key={"ideationOption-"+index} value={item.email}  disabled={participants.indexOf(item.email) < 0 ? true : false }>
                          {item.fullName + " ("+ t("Attendees.labels." + item.type)+")"}
                    </option>
                    ))
                  }
                </CSelect>
                </div>
              </div>
              <div className="text-left">
                <div className="clearfix mt-4"><FaHandPointer className="mr-1" /><small><b>{t("Execution.labels.option_votes_owner")}</b></small>
                <CSelect
                          onChange={(e) => this.props.updateSettings('votes', e.target.value)}
                          value = {settings.votes}
                          custom
                          size="sm"
                          className="col-8 float-right"
                          >
                    <option value={meeting.userInfo[0].email} disabled={participants.indexOf(meeting.userInfo[0].email) < 0 ? true : false } >
                          {meeting.userInfo[0].fullName + " (" + t("Attendees.labels.organizer")+")"}
                    </option>
                    {meeting.attendees.map((item,index) => (
                    <option  key={"ideationOption-"+index} value={item.email}  disabled={participants.indexOf(item.email) < 0 ? true : false }>
                          {item.fullName + " ("+ t("Attendees.labels." + item.type)+")"}
                    </option>
                    ))
                  }
                </CSelect>
                </div>
              </div>
              <div className="text-left">
                <div className="clearfix mt-4"><FaHandPointer className="mr-1" /><small><b>{t("Execution.labels.option_project_owner")}</b></small>
                <CSelect
                          onChange={(e) => this.props.updateSettings('project', e.target.value)}
                          value = {settings.project}
                          custom
                          size="sm"
                          className="col-8 float-right"
                          >
                    <option value={meeting.userInfo[0].email} disabled={participants.indexOf(meeting.userInfo[0].email) < 0 ? true : false } >
                          {meeting.userInfo[0].fullName + " (" + t("Attendees.labels.organizer")+")"}
                    </option>
                    {meeting.attendees.map((item,index) => (
                    <option  key={"ideationOption-"+index} value={item.email}  disabled={participants.indexOf(item.email) < 0 ? true : false }>
                          {item.fullName + " ("+ t("Attendees.labels." + item.type)+")"}
                    </option>
                    ))
                  }
                </CSelect>
                </div>
                <div><small className="text-muted">{renderHTML(t("Execution.labels.option_settings_desc"))}</small></div>
              </div>
              <hr/>
              <div className="text-left">
                <div className="clearfix mt-4"><small><b>{t("Execution.labels.option_disable_chat")}</b></small>
                  <CSwitch className="float-right" shape="pill"
                          variant='opposite' onCheckedChange={(value)=> this.props.updateSettings("chat", value)}
                          color="primary" size="sm" labelOn={t("General.labels.yes")} labelOff={t("General.labels.no")}
                          checked={settings.chat} />
                </div>
                <div><small className="text-muted">{t("Execution.labels.option_disable_chat_desc")}</small></div>
              </div>
              <div className="text-left">
                <div className="clearfix mt-4"><small><b>{t("Execution.labels.option_disable_questions")}</b></small>
                  <CSwitch className="float-right" shape="pill"
                          variant='opposite' onCheckedChange={(value)=> this.props.updateSettings("questions", value)}
                          color="primary" size="sm" labelOn={t("General.labels.yes")} labelOff={t("General.labels.no")}
                          checked={settings.questions} />
                </div>
                <div><small className="text-muted">{t("Execution.labels.option_disable_questions_desc")}</small></div>
              </div>
              <div className="text-left">
                <div className="clearfix mt-4"><small><b>{t("Execution.labels.option_disable_docs")}</b></small>
                  <CSwitch className="float-right" shape="pill"
                          variant='opposite' onCheckedChange={(value)=> this.props.updateSettings("docs", value)}
                          color="primary" size="sm" labelOn={t("General.labels.yes")} labelOff={t("General.labels.no")}
                          checked={settings.docs} />
                </div>
                <div><small className="text-muted">{t("Execution.labels.option_disable_docs_desc")}</small></div>
              </div>

              <hr/>
              <div className="text-center mt-1">
                <CButton color="primary" variant="outline" onClick={() => this.applySettings()} size="sm">{t("General.buttons.apply")}</CButton>
              </div>
            </CTabPane>
            }

          </CTabContent>
        </CTabs>

        <Objectives
            meetingObjective={this.state.meetingObjective}
            showMeetingObjective={this.state.showMeetingObjective}
            meetingObjectiveModalState={this.state.meetingObjectiveModalState}
            socket={this.props.socket}

            closeMeetingObjective={this.closeMeetingObjective}
            handleInputModal={this.handleInputModal}
            notify={this.props.notify}
        />

        <Docs
            meetingDoc={this.state.meetingDoc}
            showMeetingDoc={this.state.showMeetingDoc}
            meetingDocModalState={this.state.meetingDocModalState}
            socket={this.props.socket}

            closeMeetingDoc={this.closeMeetingDoc}
            setMeetingDocModalState={this.setMeetingDocModalState}
            handleInputModal={this.handleInputModal}
            notify={this.props.notify}
        />

        <Participant
            showAdditionalParticipant={this.state.showAdditionalParticipant}
            attendees={meeting.attendees}
            socket={this.props.socket}

            additionalParticipant={this.additionalParticipant}
            notify={this.props.notify}
        />

        <Question
            showReply={this.state.showReply}
            question={this.state.question}
            attendees={attendees}
            participants={participants}
            user={user}
            socket={this.props.socket}

            reply={this.reply}
            notify={this.props.notify}
        />
      </>
    );
  }
}

MeetingLeftBar.propTypes = propTypes;
MeetingLeftBar.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(MeetingLeftBar));
