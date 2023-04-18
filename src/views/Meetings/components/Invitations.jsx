import React, { Component } from 'react';

import {
  CAlert,
  CButton,
  CCard,CCardHeader,CCardBody,
  CCol,
  CForm,
  CLabel,
  CInput,
  CModal,CModalHeader,CModalBody,CModalFooter,
  CRow,
  CSwitch
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import MomentTZ from 'moment-timezone';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

//React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
//Text Editor
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

import _ from 'lodash';

import i18n from './../../../services/i18n';

var auth = require('./../../../services/Auth');
var meetingsHelper = require('./../../../services/Meetings');
var formsHelper = require('./../../../services/Forms');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const validations = function (values) {
  return {
    to: {
      empty: 'Invitations.errors.to_empty'
    },
    cc: {
      multipleEmails: 'Invitations.errors.error_cc',
    },
    subject: {
      required: 'Invitations.errors.subject_required'
    },
    content: {
      required: 'Invitations.errors.content_required'
    }
  }
}

class Invitations extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      loading: true,
      confirmed: false,
      submitted: false,
      errors: {},
      attendees: [],
      values: {
        to: [],
        cc: this.props.connectedUser,
        calendar: true,
        content:"",
      },
    }

    this.ref = React.createRef();

    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
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
        state.confirmed = false;
        state.submitted = false;
        state.errors = {};
        state.attendees = [];
        state.values = {
          to: [],
          cc: this.props.connectedUser,
          calendar: true,
          subject: "",
          content:""
        };
        this.setState(state);
      }
      else {
        state.errors = {};
        state.confirmed= false;
        state.loading = false;

        for(var i=0; i < this.props.meeting.attendees.length; i++ )
        {
          state.attendees.push(
            {
              value: this.props.meeting.attendees[i].email,
              label: this.props.meeting.attendees[i].email,
              presence: this.props.meeting.attendees[i].presence
            }
          );
        }
        if(state.attendees.length === 0)
        {
          state.attendees.push(
            {
              value: this.props.connectedUser,
              label: this.props.connectedUser,
              presence: "required"
            }
          );
          state.values.cc = "";
        }
        var dateTime =  meetingsHelper.prepareMailDateTime(this.props.meeting.datetime,this.props.timezone, this.props.meeting.duration);
        state.values.subject =meetingsHelper.prepareMailSubject(this.props.meeting.subject, dateTime);
        state.values.content = meetingsHelper.prepareMailContent(this.props, dateTime, i18n.language);

        this.setState(state);
      }
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    state.errors[name] = false;
    this.setState(state);
  }

  onChange = (name, value) => {
    this.handleInputChange({target: {name: name, value: value}});
  }

  async onSubmit(event) {
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

    if(isValid)
    {
      state.loading = true;
      this.setState(state);

      state.values.language = i18n.language;
      var msg = this.props.type === "request" ? "Invitations.msgs.invitations_sent_successfully" : "Invitations.msgs.notifications_sent_successfully";
      var res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_INVITE) + this.props.meeting._id + "/" + this.props.type, auth.getRequestInit('post', state.values))
      var status = res.status;
      var data = await res.json();
      if(status === 200)
      {
          state.confirmed = true;
          this.props.closeInvitations();
          this.props.notify('success', msg);
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
      this.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      this.setState(state);
    }

  }

  render() {
    const {t, show, meeting, timezone} = this.props;
    const {loading, errors, values, attendees, submitted} = this.state;
      return (
        <CModal
              show={show}
              onClose={this.props.closeInvitations}
              centered={true}
              fade={true}
              size="lg"
            >
              <CModalHeader closeButton>{this.props.type === "request" ? t("Invitations.titles.send_invitations") : t("Invitations.titles.notify_attendees")}</CModalHeader>
              <CModalBody>
              {loading
                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                :
                 <CForm onSubmit={this.onSubmit}>
                    <CRow>
                      <CCol className="col-12 overflow-auto" style={{height: '400px'}}>
                        <CCard>
                          <CCardHeader>
                            <CLabel className="font-weight-bold">{meeting.subject}</CLabel>
                            <CLabel className="ml-4 mr-2"><CIcon name="cil-calendar" className="mr-1" size="sm"/> {MomentTZ(meeting.datetime).tz(timezone).format('LL')}</CLabel>
                            <CLabel className="mr-2"><CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(meeting.datetime).tz(timezone).format('LT')} - {MomentTZ(meeting.datetime).tz(timezone).add(meeting.duration,"minutes").format('LT')} ({meetingsHelper.convertDuration(meeting.duration)})</CLabel>
                          </CCardHeader>
                          <CCardBody className="h-100">
                            <div ref={this.ref}>
                              <CRow className="mb-1">
                                <CLabel sm="2" className="col-2" htmlFor="to">{t("Invitations.labels.to")}</CLabel>
                                <CCol sm="10">
                                  <Select
                                    name="form-field-name2"
                                    value={values.to}
                                    options={attendees}
                                    placeholder="..."
                                    onChange={(value) => this.onChange("to", value)}
                                    multi
                                  />
                                </CCol>
                              </CRow>
                              {errors.to && submitted &&
                                  <CAlert className="alert-danger fade show" role="alert">{t(errors.to)}</CAlert>
                              }
                              {this.props.meeting.attendees.length !== 0 &&
                                <>
                                  <CRow className="mb-1">
                                    <CLabel sm="2" className="col-2" htmlFor="cc">{t("Invitations.labels.cc")}</CLabel>
                                    <CCol sm="10">
                                      <CInput className="form-control" name="cc" value={values.cc} onChange={this.handleInputChange} type="text" placeholder="..." />
                                    </CCol>
                                  </CRow>
                                  {errors.cc && submitted &&
                                      <CAlert className="alert-danger fade show" role="alert">{t(errors.cc)}</CAlert>
                                  }
                              </>
                              }
                              <CRow className="mb-1">
                              <CLabel sm="2" className="col-2" htmlFor="subject">{t("Invitations.labels.subject")}</CLabel>
                                <CCol sm="10">
                                  <CInput className="form-control" value={values.subject} onChange={this.handleInputChange} name="subject" type="text" placeholder="..." />
                                </CCol>
                              </CRow>
                              {errors.subject && submitted &&
                                  <CAlert className="alert-danger fade show" role="alert">{t(errors.subject)}</CAlert>
                              }
                              <CRow className="mb-1">
                                <hr/>
                                <CCol className="col-12">
                                      <ReactQuill
                                        modules={this.modules}
                                        theme="snow"
                                        value={values.content}
                                        onChange={(value) => this.onChange("content", value)}
                                      />
                                  </CCol>
                              </CRow>
                              {errors.content && submitted &&
                                  <CAlert className="alert-danger fade show" role="alert">{t(errors.content)}</CAlert>
                              }
                              <CRow>
                                <CCol className="col-12 align-self-center">
                                  <CSwitch name="calendar" size="sm" className="pt-2" variant={'3d'} color={'primary'} checked={values.calendar} onCheckedChange={(v) => this.onChange("calendar", v)} />
                                  <CLabel className="ml-2">{t("Invitations.labels.calendar_" + this.props.type)}</CLabel>
                                </CCol>
                              </CRow>
                            </div>
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
                    onClick={this.props.closeInvitations}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
              }
            </CModal>
      );
  }
}

Invitations.propTypes = propTypes;
Invitations.defaultProps = defaultProps;

export default withTranslation()(Invitations);
