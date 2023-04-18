import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
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
  CRow,
  CSpinner
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';

import Language from './../Components/Language';

var auth = require("./../../services/Auth");

class ActivateGuest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checking: true,
      redirect: false,
      password : '',
      password2 : '',
      loading : false,
      touched : {
        password: false,
        password2: false,
      },
      submitted: false,
      errors : {},
      status : null,
    };
  }

  async componentDidMount () {
    const res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_AUTH_GUEST_CHECK_TOKEN),
                          auth.getRequestInit('post', {token: this.props.match.params.token}));
    var state = this.state;
    state.checking = false;
    if(res.status !== 200)
    {
      state.redirect = true;
    }
    this.setState(state);
  }

  handleInputChange = (event) => {
    var state = this.state;
    const { value, name } = event.target;
    state.touched[name] = true;
    state.errors[name] = false;
    state[name] = value;
    this.setState(state);
  }

  isPasswordValid = (event)  => {
    // eslint-disable-next-line
    var pattern = /(?=.*[!#$%&()*+\-.\/:;<=>?@_{|}])(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).{8,32}/;
    return pattern.test(this.state.password);
  }

  isPassword2Valid = (event)  => {
    return this.state.password === this.state.password2 && this.state.password2 !== "";
  }

  getPasswordClass = () => {
    if(this.state.submitted)
      return "";

    if(this.isPasswordValid(this.state.password))
    {
        return "is-valid";
    }
    else
    {
        return this.state.touched.password ? "is-invalid" : "";
    }
  }

  getPassword2Class = (name) => {
    if(this.state.submitted)
      return "";

    if(this.isPassword2Valid())
    {
        return "is-valid";
    }
    else
    {
        return this.state.touched.password2 ? "is-invalid" : "";
    }
  }

  onSubmit = (event) => {
    event.preventDefault();

    var state = this.state;
    state.errors = {};

    if(this.isPasswordValid() && this.isPassword2Valid())
    {
        state.loading = true;
        this.setState(state);

        fetch(auth.prepareURL(process.env.REACT_APP_API_URL_AUTH_GUEST_SET_PASSWORD),
              auth.getRequestInit('post', {
                password: this.state.password,
                password2: this.state.password2,
                token: this.props.match.params.token
              }))
        .then(async res => {
          return await res.json();
        })
        .then(data => {
          if(data.errors)
          {
            state.submitted = true;
            state.errors = data.errors;
            state.loading = false;
            this.setState(state);
          }
          else
          {
           sessionStorage.setItem("passwordSet", true);
            this.props.history.push('/login');
          }
        })
        .catch(err => {
        });
    }
    else
    {

      if(state.password.length < 8 )
      {
        state.errors.password = "Login.errors.password_length";
      }
      else
      {
        if(!this.isPasswordValid())
        {
          state.errors.password = "Login.errors.password_complexity";
        }
      }

      if(!this.isPassword2Valid())
      {
        state.errors.password2 = "ResetPassword.errors.password2";
      }
      state.loading = false;
      this.setState(state);
    }
  }

  render() {
      const { t } = this.props;
      const { errors, redirect, checking } = this.state;

      if (redirect) {
        return <Redirect to={process.env.REACT_APP_LOGIN_URL} /> ;
      }

      if(checking) {
          return   <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
      }

      return (
            <div className="c-app c-default-layout flex-row align-items-center">
              <CContainer>
              <CRow className="content-center">
                  <CImg
                  src="/assets/img/logo/logo_transparent_large.png"
                  width="150px"
                  fluid
                />
                </CRow>
                <CRow className="justify-content-center">
                  <CCol md="5">
                    <CCardGroup>
                      <CCard className="p-6">
                        <CCardBody>
                          <CForm onSubmit={this.onSubmit}>
                            <h1>{t("ActivateGuest.titles.set_password")}</h1>
                            <hr/>
                            <CInputGroup className="mb-3">
                              <CInputGroupPrepend>
                                <CInputGroupText>
                                  <CIcon name="cil-lock-locked" />
                                </CInputGroupText>
                              </CInputGroupPrepend>
                              <CInput type="password"
                                placeholder={t("ResetPassword.labels.password")}
                                className={this.getPasswordClass()}
                                name="password"
                                value={this.state.password}
                                onChange={this.handleInputChange}
                                required />
                            </CInputGroup>
                            {errors.password &&
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
                                className={this.getPassword2Class()}
                                name="password2"
                                value={this.state.password2}
                                onChange={this.handleInputChange}
                                required />
                            </CInputGroup>
                            {errors.password2 &&
                              <CAlert className="alert-danger fade show" role="alert">{t(errors.password2)}</CAlert>
                            }
                            <CRow>
                              <CCol xs="12" className="text-center">
                              {this.state.loading
                                ? <CSpinner animation="border" variant="primary" />
                                : <CButton color="primary" type="submit" className="px-4">{t("General.buttons.submit")}</CButton>
                              }
                              </CCol>
                            </CRow>
                          </CForm>
                        </CCardBody>
                      </CCard>
                    </CCardGroup>
                  </CCol>
                </CRow>
                <CRow className="content-center">
                  <Language />
                </CRow>
              </CContainer>
            </div>
          );
  }
}

export default withTranslation()(ActivateGuest);
