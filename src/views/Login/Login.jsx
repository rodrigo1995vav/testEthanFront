import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CImg,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';

import _ from 'lodash';
import { isEmail } from "validator";

import ForgetPassword from './components/ForgetPassword';
import Language from './../Components/Language';

var auth = require('./../../services/Auth');

class Login extends Component {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getUsernameClass = this.getUsernameClass.bind(this);
    this.getPasswordClass = this.getPasswordClass.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.openForgetPassword = this.openForgetPassword.bind(this);
    this.closeForgetPassword = this.closeForgetPassword.bind(this);

    this.state = {
      username : '',
      password : '',
      checking : true,
      loading : false,
      touched : {
        username: false,
        password: false,
        email: false
      },
      submitted: false,
      errors : {},
      status : null,

      showForgetPassword: false
    };

    this.state.userActivated = sessionStorage.getItem("userActivated") === null ? false : true ;
    sessionStorage.removeItem("userActivated");

    this.state.passwordReset = sessionStorage.getItem("passwordReset") === null ? false : true ;
    sessionStorage.removeItem("passwordReset");

    this.state.passwordSet = sessionStorage.getItem("passwordSet") === null ? false : true ;
    sessionStorage.removeItem("passwordSet");
  }

  async componentDidMount(){
    var state = this.state;
    state.checking = false;

    const loggedIn = await auth.loggedIn();
    if(!loggedIn)
    {
      const refreshTokenValid = await auth.refreshTokenValid();
      state.redirect = (refreshTokenValid) ? true : false;
    }
    else
    {
      state.redirect = true;
    }
    this.setState(state);
  }

  handleInputChange = (event) => {
    var state = this.state;
    state.submitted = false;
    const { value, name } = event.target;
    state.touched[name] = true;
    state.errors[name] = false;
    state[name] = value;
    this.setState(state);
  }

  getUsernameClass = (field) => {
    if(this.state.submitted)
      return "";

    if(isEmail(this.state[field]))
    {
        return this.state.touched[field] ? "is-valid": "";
    }
    else
    {
        return this.state.touched[field] ? "is-invalid" : "";
    }
  }

  isPasswordValid = (event)  => {
    var pattern = /(?=.*[!#$%&()*+\-./:;<=>?@_{|}])(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).{8,32}/;
    return pattern.test(this.state.password);
  }

  getPasswordClass = (event) => {
    if(this.state.submitted)
      return "";

    if(this.isPasswordValid())
    {
        return this.state.touched["password"] ? "is-valid" : "";
    }
    else
    {
        return this.state.touched["password"] ? "is-invalid" : "";
    }
  }

  onSubmit = (event) => {
    event.preventDefault();

    if(isEmail(this.state.username) && this.isPasswordValid())
    {
        this.setState({
          loading: true,
          errors: {},
          touched : {
            username: false,
            password: false,
            email: false
          },
        });
        fetch(auth.prepareURL(process.env.REACT_APP_API_URL_AUTH_LOGIN),
              auth.getRequestInit('post', {
                username: this.state.username,
                password: this.state.password
              }))
        .then(async res => {
          return await res.json();
        })
        .then(data => {
          var state = this.state;
          if(data.errors)
          {
            state.errors = data.errors;
            state.loading = false;
            state.submitted = true;
          }
          else
          {
            auth.setToken(data.user);
            state.redirect = true;
          }
          this.setState(state);
        })
        .catch(err => {
        });
    }
    else
    {
      var errors = this.state.errors;
      if(!isEmail(this.state.username))
      {
        errors.username = "Login.errors.email_not_valid";
      }
      if(this.state.password.length < 8 )
      {
        errors.password = "Login.errors.password_length";
      }
      else
      {
        errors.password = "Login.errors.password_complexity";
      }
      this.setState({
        loading: false,
        errors: errors
      });
    }
  }

  openForgetPassword = (event) => {
    this.setState({
      showForgetPassword: true
    });
  }

  closeForgetPassword = (event) => {
    this.setState({
      showForgetPassword: false
    });
  }

  render() {
    const { t } = this.props;
    const { errors, checking, redirect, userActivated, passwordSet, passwordReset, username, password } = this.state;

    if (redirect) {
      if(_.isUndefined(this.props.match.params.code))
      {
        return <Redirect to={process.env.REACT_APP_HOME_URL} /> ;
      }
      else
      {
        return <Redirect to={process.env.REACT_APP_JOINING_URL + this.props.match.params.code} /> ;
      }
    }
    else
    {
      return (
        <div className="c-app c-default-layout flex-row align-items-center">
          <CContainer>
          {checking
            ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
            :
            <>
              <CRow className="content-center">
                <CImg
                src="/assets/img/logo/logo_transparent_large.png"
                width="150px"
                fluid
              />
              </CRow>
              <CRow className="justify-content-center">
                <CCol md="8">
                  <CCardGroup>
                    <CCard className="p-4">
                      <CCardBody>
                        <CForm onSubmit={this.onSubmit}>
                          <h1>{t("Login.titles.login")}</h1>
                          <p className="text-muted">{t("Login.titles.login_desc")}</p>
                          { (userActivated || passwordSet) &&
                            <CAlert className="alert-success fade show center-block text-center" role="alert">{t("Login.msgs.account_activated_successfully")}</CAlert>
                          }
                          {passwordReset &&
                            <CAlert className="alert-success fade show center-block text-center" role="alert">{t("Login.msgs.password_changed_successfully")}</CAlert>
                          }
                          <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-user" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text"
                              placeholder={t("Login.labels.username")}
                              className={this.getUsernameClass("username")}
                              name="username"
                              value={username}
                              onChange={this.handleInputChange}
                              required />
                          </CInputGroup>
                          {errors.username &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.username)}</CAlert>
                          }
                          <CInputGroup className="mb-4">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-lock-locked" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="password"
                              placeholder={t("Login.labels.password")}
                              className={this.getPasswordClass()}
                              name="password"
                              autoComplete="off"
                              value={password}
                              onChange={this.handleInputChange}
                              required  />
                          </CInputGroup>
                          {errors.password &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.password)}</CAlert>
                          }
                          {errors.auth &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.auth)}</CAlert>
                          }
                          <CRow>
                            <CCol xs="4">
                            {this.state.loading
                              ? <CSpinner animation="border" variant="primary" />
                              : <CButton color="primary" type="submit" className="px-4">{t("General.buttons.submit")}</CButton>
                            }
                            </CCol>
                            <CCol xs="8" className="text-right">
                              <CButton color="link" className="px-0" onClick={this.openForgetPassword} >{t("Login.links.forgot_password")}</CButton>
                            </CCol>
                          </CRow>
                        </CForm>
                      </CCardBody>
                    </CCard>
                    <CCard className="py-4 d-md-down-none" style={{ width: '44%' }}>
                      <CCardBody className="text-right">
                          <h1 className="text-warning">{t("Login.titles.sign_up")}</h1>
                          <CListGroup accent className="text-left">
                            <CListGroupItem accent="secondary">{t("Login.list_item_1")}</CListGroupItem>
                            <CListGroupItem accent="info">{t("Login.list_item_2")}</CListGroupItem>
                            <CListGroupItem accent="warning">{t("Login.list_item_3")}</CListGroupItem>
                          </CListGroup>
                          <Link to="/register">
                            <CButton color="info" className="mt-3" active tabIndex={-1}>{t("Login.links.register_now")}</CButton>
                          </Link>
                      </CCardBody>
                    </CCard>
                  </CCardGroup>
                </CCol>
              </CRow>
              <CRow className="content-center">
                  <Language />
              </CRow>
            </>
            }
          </CContainer>

          <ForgetPassword
            show={this.state.showForgetPassword}
            closeForgetPassword={this.closeForgetPassword}
            />
        </div>
      );
    }

  }
}

export default withTranslation()(Login);
