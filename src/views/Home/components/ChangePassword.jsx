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
  CSpinner
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

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
    currentPassword: {
      min: [8, 'Login.errors.password_length'],
      // eslint-disable-next-line
      matches: [/(?=.*[!#$%&()*+\-./:;<=>?@_{|}])(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).{8,32}/,
              'Login.errors.password_complexity'],
    },
    password: {
      min: [8, 'Login.errors.password_length'],
      // eslint-disable-next-line
      matches: [/(?=.*[!#$%&()*+\-./:;<=>?@_{|}])(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).{8,32}/,
              'Login.errors.password_complexity'],
      not_equal: [values.currentPassword, 'ChangePassword.errors.current_password']
    },
    password2: {
      required: 'Register.errors.password2_required',
      equal: [values.password, 'ResetPassword.errors.password2']
    },
  }
}

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      loading: false,
      touched: {},
      errors: {},
      values: {
        currentPassword: "",
        password: "",
        password2: ""
      }
   }
  }

  static getDerivedStateFromProps(props, state) {
    if(!props.show)
    {
      state.submitted = false;
      state.touched = {};
      state.errors = {};
      state.values = {
        currentPassword: "",
        password: "",
        password2: ""
      }
      return state;
    }
    return null;
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.touched[name] = true;
    state.errors[name] = false;
    state.values[name] = value;
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

      fetch(auth.prepareURL(process.env.REACT_APP_API_URL_CHANGE_PASSWORD), auth.getRequestInit('post', state.values))
      .then(async res => {
        state.status = res.status;
        return await res.json();
      })
      .then(data => {
        state.loading = false;
        if(state.status === 200)
        {
          this.props.closeChangePassword();
          this.props.notify('success', 'Login.msgs.password_changed_successfully');
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
              onClose={this.props.closeChangePassword}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton>{t("ChangePassword.titles.change_password")}</CModalHeader>
              <CModalBody>
                <CForm onSubmit={this.onSubmit}>
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-lock-locked" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput type="password"
                            placeholder={t("ChangePassword.labels.currentPassword")}
                            className={this.getFieldClass("currentPassword")}
                            name="currentPassword"
                            value={values.currentPassword}
                            onChange={this.handleInputChange}
                          />
                        </CInputGroup>
                        {errors.currentPassword && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.currentPassword)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-lock-locked" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput type="password"
                            placeholder={t("ResetPassword.labels.password")}
                            className={this.getFieldClass("password")}
                            name="password"
                            value={values.password}
                            onChange={this.handleInputChange}
                           />
                        </CInputGroup>
                        {errors.password && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.password)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-lock-locked" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput type="password"
                            placeholder={t("ResetPassword.labels.password2")}
                            className={this.getFieldClass("password2")}
                            name="password2"
                            value={values.password2}
                            onChange={this.handleInputChange}
                           />
                        </CInputGroup>
                        {errors.password2 && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.password2)}</CAlert>
                        }
                </CForm>
              </CModalBody>
              <CModalFooter>
                {loading
                ? <CSpinner animation="border" variant="primary" />
                : <CButton color="primary" type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                }
                <CButton
                  color="secondary"
                  onClick={this.props.closeChangePassword}
                >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
            </CModal>
      );
  }
}


ChangePassword.propTypes = propTypes;
ChangePassword.defaultProps = defaultProps;


export default withTranslation()(ChangePassword);
