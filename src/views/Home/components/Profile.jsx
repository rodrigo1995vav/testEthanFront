import React, { Component } from 'react';
import {
  CAlert,
  CButton,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import TimezonePicker from 'react-bootstrap-timezone-picker';
import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
import MomentTZ from 'moment-timezone';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

var auth = require('./../../../services/Auth');
var formsHelper = require('./../../../services/Forms');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const validations = function (values) {
  return {
    phone: {
      matches: [/^[0-9\-.+]+$/,
              'Register.errors.phone_matches'],
    },
    timezone: {
      required: 'Register.errors.timezone_required'
    }
  }
}

class Profile extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);

    var temp = Object.values(MomentTZ.tz.names());
    var timezones = {};
    for(var i=0; i < temp.length; i++)
    {
        timezones[temp[i] + " (GMT" + MomentTZ.tz(temp[i]).format('Z') + ")"] = temp[i];
    }

    this.state = {
      loading: true,
      confirmed: false,
      touched: {},
      errors: {},
      values: {
        phone: "",
        firstName: "",
        lastName: "",
        email: "",
        timezone: MomentTZ.tz.guess()
      },
      timezones: timezones,
      role: _.toLower(auth.getValue("role"))
   }
  }

  componentDidUpdate (prevProps, prevStates)  {
    if(prevProps.show !== this.props.show)
    {
      var state = this.state;
      if(this.props.show)
      {
          fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_VIEW), auth.getRequestInit('get', null))
          .then(async res => {
            state.status = res.status;
            return await res.json();
          })
          .then(data => {
            state.loading = false;
            state.confirmed = false;
            if(state.status === 200)
            {
              data = data.user;
              state.values.firstName = data.firstName;
              state.values.lastName = data.lastName;
              state.values.email = data.email;
              state.values.phone = data.phone;
              state.values.timezone = data.timezone;
            }
            else
            {
              state.errors = data.errors;
            }
            this.setState(state);
          })
          .catch(err => {
            console.log(err);
          });
      }
      else
      {
        state.loading = true;
        state.submitted = false;
        state.touched = {};
        state.errors = {};
        this.setState(state);
      }
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.errors[name] = false;
    state.touched[name] = true;
    state.values[name] = value;
    this.setState(state);
  }

  onChange = (name, value) => {
    this.handleInputChange({target: {name: name, value: value}});
  }

  getFieldClass = (name) => {
    if(!this.state.touched[name])
      return "";
    else
    {
      return !formsHelper.isFieldInvalid( name, this.state.values, validations) ? "is-valid" : "is-invalid";
    }
  }

  reload = () => {
    window.location.reload(false);
  }

  onSubmit = (event) => {
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

      fetch(process.env.REACT_APP_API_URL_USERS_PROFILE, auth.getRequestInit('put', state.values))
      .then(async res => {
        state.status = res.status;
        return await res.json();
      })
      .then(data => {
        if(state.status === 200)
        {
          state.loading = false;
          this.props.closeProfile();
          if(auth.getTimezone() !== state.values.timezone)
          {
            this.props.updateTZ(state.values.timezone);
          }
          this.props.notify('success', 'Profile.msgs.profile_updated_successfully');
        }
        else
        {
          state.errors = data.errors;
        }
        this.setState(state);
      })
      .catch(err => {
      });
    }
    else
    {
      this.setState(state);
    }
  }

  render() {
    const { t, show } = this.props;
    const {loading, submitted, errors, values} = this.state;

    return (
        <CModal
              show={show}
              onClose={this.props.closeProfile}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton>{t("Profile.titles.profile")}</CModalHeader>
              <CModalBody>
                {loading
                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                : <CForm onSubmit={this.onSubmit}>
                  <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          type="text"
                          name="firstName"
                          placeholder={t("Register.labels.firstName")}
                          value={values.firstName}
                          disabled />
                        <CInput
                          type="text"
                          name="lastName"
                          placeholder={t("Register.labels.lastName")}
                          value={values.lastName}
                          disabled />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                              <CIcon name="cil-phone" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput
                              type="text"
                              name="phone"
                              className={this.getFieldClass("phone")}
                              placeholder="XXX-XXX-XXXX"
                              value={values.phone}
                              autoComplete="off"
                              onChange={this.handleInputChange}
                              required />
                    </CInputGroup>
                    {errors.phone && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.phone)}</CAlert>
                    }
                    <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>@</CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          type="text"
                          name="email"
                          placeholder={t("Register.labels.email")}
                          value={values.email}
                          disabled />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-clock" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <TimezonePicker
                            absolute = {true}
                            defaultValue={values.timezone}
                            value={values.timezone}
                            placeholder={t("Register.labels.timezone")}
                            className={this.getFieldClass("timezone")}
                            onChange={(value => this.onChange("timezone", value))}
                            timezones={this.state.timezones}
                            style={{width: "90%"}}
                          />
                    </CInputGroup>
                    {errors.timezone && submitted &&
                              <CAlert className="alert-danger fade show" role="alert">{t(errors.timezone)}</CAlert>
                      }
                </CForm>
                }
              </CModalBody>
              {loading === false &&
              <CModalFooter>
                  <CButton color="primary" type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeProfile}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
              }
            </CModal>
      );
  }
}

Profile.propTypes = propTypes;
Profile.defaultProps = defaultProps;


export default withTranslation()(Profile);
