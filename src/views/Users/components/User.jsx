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
  CSelect,
  CSpinner
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

import i18n from './../../../services/i18n';

var auth = require('./../../../services/Auth');
var formsHelper = require('./../../../services/Forms');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};


const validations = function (values) {
  return {
    firstName: {
      required: 'Register.errors.firstName_required',
      min: [2,'Register.errors.firstName_length']
    },
    lastName: {
      required: 'Register.errors.lastName_required',
      min: [2,'Register.errors.lastName_length']
    },
    email: {
      required: 'Register.errors.email_required',
      email: 'Login.errors.email_not_valid'
    },
    phone: {
      matches: [/^[0-9\-.+]+$/,
              'Register.errors.phone_matches'],
    }
  }
}


class User extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      loading: false,
      touched: {},
      errors: {},
      values: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        status: "",
        role: "User"
      },
      connectedUser: auth.getValue("email")
   }
  }

  static getDerivedStateFromProps(props, state) {
    return null;
  }

  componentDidUpdate (prevProps, prevStates)  {
    if(prevProps.show !== this.props.show)
    {
      var state = this.state;
      if(!this.props.show)
      {
        state.loading= false;
        state.touched = {};
        state.errors = {};
        state.values = {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          status: "",
          role: "User"
        }
        this.setState(state);
      }
      else {
        if(!_.isNull(this.props.user))
        {
          state.values = {
            firstName: this.props.user.firstName,
            lastName: this.props.user.lastName,
            email: this.props.user.email,
            phone: this.props.user.phone,
            role: this.props.user.role,
            status: this.props.user.status
          }
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
    this.setState(state);
  }

  getFieldClass = (name) => {
    if(!this.state.touched[name])
      return "";
    else
    {
      return !formsHelper.isFieldInvalid(name, this.state.values, validations) ? "is-valid" : "is-invalid";
    }
  }

  onSubmit = (event) => {
    event.preventDefault();
    var state = this.state;

    var isValid = true;
    _.forEach(this.state.values, function(v, k) {
      var error = formsHelper.isFieldInvalid(k, state.values, validations);
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
      state.values.language = i18n.language;
      this.setState(state);

      var msg = _.isNull(this.props.user) ? "User.msgs.user_created_successfully" : "User.msgs.user_updated_successfully";

      fetch(auth.prepareURL((_.isNull(this.props.user) ? process.env.REACT_APP_API_URL_USERS_INSERT : (process.env.REACT_APP_API_URL_USERS_UPDATE + this.props.user._id))) ,
        auth.getRequestInit( (_.isNull(this.props.user) ? 'post' : 'put') , state.values))
      .then(async res => {
        state.status = res.status;
        return await res.json();
      })
      .then(data => {
        state.loading = false;
        if(state.status === 200)
        {
          this.props.closeUser();
          this.props.notify('success', msg);
          this.props.fetchUsers();
        }
        else
        {
          state.errors = data.errors;
          this.setState(state);
        }
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
    const { t, show, user } = this.props;
    const {loading, submitted, errors, values, connectedUser} = this.state;

      return (
        <CModal
              show={show}
              onClose={this.props.closeUser}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton>{_.isNull(user) ? t("User.titles.new_user"): t("User.titles.edit_user")}</CModalHeader>
              <CModalBody>
                <CForm onSubmit={this.onSubmit}>
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
                          className={this.getFieldClass("firstName")}
                          value={values.firstName}
                          autoComplete="off"
                          onChange={this.handleInputChange}
                          />
                        <CInput
                          type="text"
                          name="lastName"
                          placeholder={t("Register.labels.lastName")}
                          className={this.getFieldClass("lastName")}
                          value={values.lastName}
                          autoComplete="off"
                          onChange={this.handleInputChange}
                          />
                    </CInputGroup>
                    {errors.firstName && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.firstName)}</CAlert>
                      }
                      {errors.lastName && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.lastName)}</CAlert>
                      }
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
                            />
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
                          className={this.getFieldClass("email")}
                          value={values.email}
                          autoComplete="off"
                          onChange={this.handleInputChange}
                          />
                    </CInputGroup>
                    {errors.email && submitted &&
                          <CAlert className="alert-danger fade show" role="alert">{t(errors.email)}</CAlert>
                      }
                    <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>{t("Users.labels.role")}</CInputGroupText>
                        </CInputGroupPrepend>
                        <CSelect
                          name="role"
                          custom
                          value={values.role}
                          onChange={this.handleInputChange}
                          >
                            <option value="User">{t("Users.labels.User")}</option>
                            <option value="Superuser">{t("Users.labels.Superuser")}</option>
                        </CSelect>
                    </CInputGroup>
                    {!_.isNull(user) && user.email !== connectedUser &&
                      <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>{t("Users.labels.status")}</CInputGroupText>
                        </CInputGroupPrepend>
                        <CSelect
                          name="status"
                          custom
                          className="text-center"
                          value={values.status}
                          onChange={this.handleInputChange}
                          >
                            <option value="inactive">{t("Users.labels.status_inactive")}</option>
                            <option value="active">{t("Users.labels.status_active")}</option>
                            <option value="locked">{t("Users.labels.status_locked")}</option>
                        </CSelect>
                    </CInputGroup>
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
                  onClick={this.props.closeUser}
                >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
            </CModal>
      );
    }
}

User.propTypes = propTypes;
User.defaultProps = defaultProps;

export default withTranslation()(User);
