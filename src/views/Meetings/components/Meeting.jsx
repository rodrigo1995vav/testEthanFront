import React, { Component } from 'react';

import {
  CAlert,
  CButton,
  CCard,CCardHeader,CCardBody,
  CCol,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CModal,CModalHeader,CModalBody,CModalFooter,
  CRow,
  CSelect,
  CNav,CNavItem,CNavLink,
  CTabs,CTabContent,CTabPane, CBadge
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import MomentTZ from 'moment-timezone';
import Moment from 'moment';

//DatePicker
import DatePicker from 'react-date-picker';
//TimePicker
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
//Text Editor
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

import i18n from './../../../services/i18n';
import { CTextarea } from '@coreui/react/lib/CInput';

import Agenda from './../subComponents/Agenda';
import Attendees from './../subComponents/Attendees';
import Goals from './../subComponents/Goals';
import Docs from './../subComponents/Docs';


var auth = require('./../../../services/Auth');
var formsHelper = require('./../../../services/Forms');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const validations = function (values) {
  return {
    subject: {
      required: 'Meeting.errors.subject_required'
    },
    type: {
      required: 'Meeting.errors.type_required'
    },
    date: {
      required: 'Meeting.errors.date_required'
    },
    time: {
      required: 'Meeting.errors.time_required'
    },
    duration: {
      required: 'Meeting.errors.duration_required',
      not_equal: [0, 'Meeting.errors.duration_equal_to_zero']
    },
  }
}

class Meeting extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.componentsInitialized = this.componentsInitialized.bind(this);
    this.setAgenda = this.setAgenda.bind(this);
    this.setGoals = this.setGoals.bind(this);
    this.setAttendees = this.setAttendees.bind(this);
    this.setDocs = this.setDocs.bind(this);
    this.getFieldClass = this.getFieldClass.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      loading: true,
      touched: {},
      errors: {},
      values: {
        subject: "",
        description: "",
        reference: "",
        type: "",
        timezone: auth.getTimezone(),
        datetime: new Date(),
        date: "",
        time: null,
        notes: '',
        duration: 0,
        duration_h: "",
        duration_m: "",
        //Agenda component
        agenda: [],
        agenda_duration: 0,
        //Goals component
        goals: [],
        //Attendees component
        attendees: [],
        //Documents component
        docs: [],

        initializeComponents: false,
      },
      connectedUser: auth.getValue("email")
    }

    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large'] }],          // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }]
      ]
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.show !== this.props.show)
    {
      var state = this.state;
      if(!this.props.show)
      {
        state.loading= true;
        state.touched = {};
        state.errors = {};
        state.values = {
          subject: "",
          description: "",
          reference: "",
          type: "",
          timezone: auth.getTimezone(),
          datetime: new Date(),
          secure: false,
          date: "",
          time: null,
          notes: '',
          duration: 0,
          duration_h: "",
          duration_m: "",
          //Agenda component
          agenda: [],
          agenda_duration: 0,
          //Goals component
          goals: [],
          //Attendees component
          attendees: [],
          //Documents component
          docs: [],

          initializeComponents: true,
        };
        this.setState(state);
      }
      else {
        state.errors = {};

        if(!_.isNull(this.props.meeting))
        {
          var meeting = this.props.meeting;
          _.forEach(meeting, function(value, key) {
                if (_.indexOf(['subject', 'description', 'reference', 'type', 'timezone', 'datetime', 'code' ,'secure', 'notes', 'duration'], key) >= 0)
                    state.values[key] = value;
          });

          state.values.datetime = new Date(state.values.datetime);
          state.values.date = state.values.datetime;
          state.values.time = Moment(state.values.datetime);

          state.values.duration_m = state.values.duration % 60;
          state.values.duration_h = (state.values.duration - state.values.duration_m) / 60;

          //Agenda Component
          state.values.agenda_duration = 0;
          for(var i=0; i < meeting.agenda.length; i++)
          {
            state.values.agenda_duration += _.toInteger(meeting.agenda[i].duration);
          }
          state.values.agenda = _.clone(meeting.agenda);
          //Goals Component
          state.values.goals = _.clone(meeting.goals);
          //Attendees Component
          state.values.attendees = _.clone(meeting.attendees);
          //Documents Component
          state.values.docs = _.clone(meeting.docs);

          state.values.initializeComponents = true;

          state.loading = false;
          this.setState(state);
        }
        else
        {
          state.loading = false;
          this.setState(state);
        }
      }
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.errors[name] = false;
    state.touched[name] = true;
    state.values[name] = value;

    switch(name)
    {
      case "duration_h":
      case "duration_m":
        state.touched.duration = true;
        state.errors.duration = false;
        state.values.duration = _.toInteger(state.values.duration_h) * 60 + _.toInteger(state.values.duration_m);
      break;
      case "time":
        var temp = new Date(value);
        state.values.datetime.setHours(temp.getHours());
        state.values.datetime.setMinutes(temp.getMinutes());
        state.values.datetime.setSeconds(0);
        break;
      case "date":
        if(!_.isNull(value))
        {
          state.values.datetime.setDate(value.getDate());
          state.values.datetime.setMonth(value.getMonth());
          state.values.datetime.setYear(value.getFullYear());
        }
      break;
      default:
    }
    this.setState(state);
  }

  onChange = (name, value) => {
    this.handleInputChange({target: {name: name, value: value}});
  }

  componentsInitialized = () => {
    var state = this.state;
    state.values.initializeComponents = false;
    this.setState(state);
  }

  setAgenda = (duration,items) => {
    var state = this.state;
    state.values.agenda_duration = duration;
    state.errors.duration = false;
    state.values.agenda = items;
    this.setState(state);
  }

  setGoals = (items) => {
    var state = this.state;
    state.values.goals = _.orderBy(items, ['priority', 'item'], ['desc', 'asc']);
    this.setState(state);
  }

  setAttendees = (items) => {
    var state = this.state;
    state.values.attendees = _.orderBy(items, ['presence', 'type', 'fullName'], ['desc','asc','asc']);
    this.setState(state);
  }

  setDocs = (items) => {
    var state = this.state;
    state.values.docs = _.orderBy(items, ['name'], ['asc']);
    this.setState(state);
  }

  getFieldClass = (name) => {
    if(!this.state.touched[name])
      return "";
    else
    {
      return !formsHelper.isFieldInvalid( name, this.state.values, validations) ? "is-valid" : "is-invalid";
    }
  }

  async onSubmit (event) {
    event.preventDefault();
    var state = this.state;

    var isValid = true;
    _.forEach(this.state.values, function(v, k) {
      var error = formsHelper.isFieldInvalid( k, state.values, validations);
      if(_.isString(error))
      {
        isValid = false;
        state.errors[k] = error;
      }
    });

    state.submitted = true;
    state.touched = {};

    if(state.values.agenda_duration !== state.values.duration)
    {
      isValid = false;
      state.errors.duration = state.values.agenda_duration > state.values.duration ? "Meeting.errors.meeting_shorter_agenda" : "Meeting.errors.agenda_shorter_meeting";
    }

    if(isValid)
    {
      state.loading = true;
      this.setState(state);
      var meeting = this.props.meeting;
      var msg = _.isNull(this.props.meeting) ? "Meeting.msgs.meeting_created_successfully" : "Meeting.msgs.meeting_updated_successfully";
      var res = await fetch(auth.prepareURL((_.isNull(this.props.meeting) ? process.env.REACT_APP_API_URL_MEETINGS_INSERT:process.env.REACT_APP_API_URL_MEETINGS_UPDATE + this.props.meeting._id )),
                      auth.getRequestInit(_.isNull(this.props.meeting) ? 'post' : 'put', state.values));

      var status = res.status;
      var data = await res.json();
      if(status === 200)
      {
        this.props.closeMeeting();
        this.props.notify('success', msg);
        this.props.fetchMeetings(true,
                                _.isNull(meeting) ? false : ((new Date(meeting.datetime) < new Date() ? true : false)),
                                false);
      }
      else
      {
        state.loading = false;
        state.errors = data.errors;
        this.setState(state);
      }
    }
    else
    {
      this.setState(state);
    }
  }

  render() {
    const {t, show, meeting, timezone} = this.props;
    const {loading, submitted, errors, values} = this.state;

      return (
        <CModal
              show={show}
              onClose={this.props.closeMeeting}
              centered={true}
              fade={true}
              size="xl"
            >
              <CModalHeader closeButton>
                {_.isNull(meeting) ? t("Meeting.titles.new_meeting"): t("Meeting.titles.edit_meeting")}
                </CModalHeader>
              <CModalBody>
              {loading
                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                :
                 <CForm onSubmit={this.onSubmit}>
                    <CRow>
                      <CCol xs="12" sm="5">
                        <CCard className="overflow-auto"  style={{height: '385px'}}>
                          <CCardHeader>
                            {t("Meeting.titles.general_information")}
                            {!_.isNull(meeting) &&
                              <CBadge color="info" className="ml-5 font-italic">{t("Meeting.labels.code") + ": " + values.code}</CBadge>
                            }
                          </CCardHeader>
                          <CCardBody>
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-bookmark" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                      type="text"
                                      name="subject"
                                      placeholder={t("Meeting.labels.subject")}
                                      className={this.getFieldClass("subject")}
                                      value={values.subject}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      />
                              </CInputGroup>
                              {errors.subject && submitted &&
                                      <CAlert className="alert-danger font-sm fade show" role="alert">{t(errors.subject)}</CAlert>
                              }
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-layers" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSelect
                                      name="type"
                                      custom
                                      value={values.type}
                                      onChange={this.handleInputChange}
                                      className={"text-left "+this.getFieldClass("type")}
                                      >
                                        <option value="">{t("Meeting.labels.type")}</option>
                                        <option value="board">{t("Meeting.labels.board_meeting")}</option>
                                        <option value="ideation">{t("Meeting.labels.ideation")}</option>
                                        <option value="interview">{t("Meeting.labels.interview")}</option>
                                        <option value="planning">{t("Meeting.labels.planning")}</option>
                                        <option value="other">{t("Meeting.labels.other")}</option>
                                        <option value="status">{t("Meeting.labels.status")}</option>
                                        <option value="webinar">{t("Meeting.labels.webinar")}</option>
                                    </CSelect>
                                    <CInputGroupPrepend  className="ml-2">
                                      <CInputGroupText>
                                        <CIcon name="cil-tags" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                      type="text"
                                      name="reference"
                                      placeholder={t("Meeting.labels.reference")}
                                      value={values.reference}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      />
                              </CInputGroup>
                              {errors.type && submitted &&
                                      <CAlert className="alert-danger font-sm fade show" role="alert">{t(errors.type)}</CAlert>
                              }
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-comment-square" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CTextarea
                                      name="description"
                                      placeholder={t("Meeting.labels.description")}
                                      value={values.description}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      />
                              </CInputGroup>
                              {/*}
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-lock-locked" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSwitch className=" m-1 " variant={'3d'} color="dark"  checked={values.secure}  onCheckedChange={(value => this.onChange("secure", value))}/>
                                    {values.secure
                                      ? <small className="m-2 help-block text-muted text-center alert-success">{t("Meeting.labels.secure_meeting_checked")}</small>
                                      : <small className="m-2 help-block text-muted text-center alert-info">{t("Meeting.labels.secure_meeting_unchecked")}</small>
                                    }
                                  </CInputGroup>*/}

                              <CInputGroup className="mb-2">
                                      <CInputGroupPrepend>
                                        <CInputGroupText>
                                          <CIcon name="cil-calendar" />
                                        </CInputGroupText>
                                      </CInputGroupPrepend>
                                      <DatePicker
                                      name="date"
                                      locale={i18n.language}
                                      placeholder={t("Meeting.labels.date")}
                                      onChange={(value => this.onChange("date", value))}
                                      minDate={new Date()}
                                      value={values.date}
                                      format="dd/MM/y"
                                      className={this.getFieldClass("date")}
                                      />
                              </CInputGroup>
                              <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText>
                                          <CIcon name="cil-clock" />
                                        </CInputGroupText>
                                      </CInputGroupPrepend>
                                      <TimePicker
                                        style={{ width: 120 }}
                                        placeholder={t("Meeting.labels.time")}
                                        name="time"
                                        showSecond={false}
                                        allowEmpty={false}
                                        value={values.time}
                                        minuteStep={15}
                                        onChange={(value => this.onChange("time", value))}
                                        inputReadOnly={true}
                                        className={this.getFieldClass("time")}
                                      />
                                      <small className="ml-3 mt-2 text-primary">
                                        {MomentTZ.tz.guess() + " (GMT" + MomentTZ.tz(MomentTZ.tz.guess()).format('Z') + ")" }
                                      </small>
                              </CInputGroup>
                              <CInputGroup className="mb-2">
                              {Moment.tz.guess() !== timezone &&
                                    <small className="text-danger">
                                      TEAM-1.CO {t("Meeting.labels.timezone") + " - " + values.timezone + " (GMT" + MomentTZ.tz(values.timezone).format('Z') + ")"}<br/>
                                      {t("Meeting.labels.timezone_help")}
                                    </small>
                              }
                              </CInputGroup>
                              {errors.date && submitted &&
                                      <CAlert className="alert-danger fade show font-sm" role="alert">{t(errors.date)}</CAlert>
                              }
                              {errors.time && submitted &&
                                      <CAlert className="alert-danger fade show font-sm" role="alert">{t(errors.time)}</CAlert>
                              }

                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend className="small">
                                      <CInputGroupText >
                                        <CIcon name="cil-speedometer" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSelect
                                      name="duration_h"
                                      custom
                                      size="sm"
                                      onChange={this.handleInputChange}
                                      value={values.duration_h}
                                      className={"text-center col-3 " + this.getFieldClass("duration")}
                                      >
                                        <option value="">{t("Meeting.labels.duration_h")}</option>
                                        <option value="0">0H</option>
                                        <option value="1">1H</option>
                                        <option value="2">2H</option>
                                        <option value="3">3H</option>
                                        <option value="4">4H</option>
                                        <option value="5">5H</option>
                                      </CSelect>

                                      <CSelect
                                      name="duration_m"
                                      custom
                                      size="sm"
                                      onChange={this.handleInputChange}
                                      value={values.duration_m}
                                      className={"text-center ml-1 col-3 " + this.getFieldClass("duration")}
                                      >
                                        <option value="0">{t("Meeting.labels.duration_m")}</option>
                                        <option value="15">15M</option>
                                        <option value="30">30M</option>
                                        <option value="45">45M</option>
                                      </CSelect>
                            </CInputGroup>
                            {errors.duration && submitted &&
                                 <CAlert className="alert-danger fade show font-sm" role="alert">{t(errors.duration)}</CAlert>
                            }

                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol xs="12" sm="7">
                        <CCard>
                          <CCardBody>
                            <CTabs fade={false}>
                              <CNav variant="tabs" className='nav-underline nav-underline-primary'>
                                <CNavItem>
                                  <CNavLink>
                                    <CIcon name="cil-speedometer"  className="mr-1"/>
                                    {t("Meeting.titles.agenda")}
                                    <CBadge color="primary" className="ml-1">{values.agenda.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                  <CNavLink>
                                    <CIcon name="cil-task"  className="mr-1"/>
                                    {t("Meeting.titles.goals")}
                                    <CBadge color="primary" className="ml-1">{values.goals.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                  <CNavLink>
                                    <CIcon name="cil-people"  className="mr-1"/>
                                    {/*t("Meeting.titles.attendees")*/}
                                    <CBadge color="primary" className="ml-1">{values.attendees.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                  <CNavLink>
                                    <CIcon name="cil-file"  className="mr-1"/>
                                    {/*t("Meeting.titles.documents")*/}
                                    <CBadge color="primary" className="ml-1">{values.docs.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                  <CNavLink>
                                    <CIcon name="cil-pencil" /> {/*t("Meeting.titles.notes")*/}
                                  </CNavLink>
                                </CNavItem>
                              </CNav>
                              <CTabContent>
                                <CTabPane className="p-2 overflow-auto" style={{height: '305px'}}>
                                  <Agenda
                                    meeting_duration={values.duration}
                                    agenda_duration={values.agenda_duration}
                                    agenda={values.agenda}
                                    setAgenda={this.setAgenda}
                                    initializeComponents={values.initializeComponents}
                                    componentsInitialized={this.componentsInitialized}
                                    />
                                </CTabPane>
                                <CTabPane className="p-2 overflow-auto" style={{height: '305px'}}>
                                  <Goals
                                    goals={values.goals}
                                    setGoals={this.setGoals}
                                    initializeComponents={values.initializeComponents}
                                    componentsInitialized={this.componentsInitialized}
                                    />
                                </CTabPane>
                                <CTabPane className="p-2 overflow-auto" style={{height: '305px'}}>
                                  <Attendees
                                    attendees={values.attendees}
                                    setAttendees={this.setAttendees}
                                    connectedUser={this.state.connectedUser}
                                    initializeComponents={values.initializeComponents}
                                    componentsInitialized={this.componentsInitialized}
                                    />
                                </CTabPane>
                                <CTabPane className="p-2 overflow-auto" style={{height: '305px'}}>
                                  <Docs
                                    docs={values.docs}
                                    setDocs={this.setDocs}
                                    initializeComponents={values.initializeComponents}
                                    componentsInitialized={this.componentsInitialized}
                                    />
                                </CTabPane>
                                <CTabPane className="p-2 overflow-auto" style={{height: '305px'}}>
                                  <ReactQuill
                                    className="h-75"
                                    modules={this.modules}
                                    theme="snow"
                                    value={values.notes}
                                    onChange={(value) => this.onChange("notes", value)}
                                  />
                                </CTabPane>
                              </CTabContent>
                            </CTabs>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                  </CForm>
                }
              </CModalBody>
              {loading === false &&
                <CModalFooter>
                  <CButton color="primary" type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeMeeting}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
              }
            </CModal>
      );
  }
}


Meeting.propTypes = propTypes;
Meeting.defaultProps = defaultProps;

export default withTranslation()(Meeting);
