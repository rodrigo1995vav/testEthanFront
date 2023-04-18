import React, { Component } from 'react';
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CRow,
  CSpinner
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';
import { CInputGroupAppend } from '@coreui/react/lib/CInputGroupAddon';

import renderHTML from 'react-render-html';
import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import { isEmail } from "validator";

import i18n from './../../../services/i18n';

var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class ForgetPassword extends Component {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getEmailClass = this.getEmailClass.bind(this);
    this.state = {
      loading: false,
      confirmed: false,
      submitted: false,
      touched: false,
      errors: {},
      email: ''
   }
  }

  static getDerivedStateFromProps(props, state) {
    if(!props.show)
    {
      state.confirmed = false;
      state.submitted = false;
      state.email = "";
      state.touched = false;
      state.errors = {};
      return state;
    }
    return null;
  }

  handleInputChange = (event) => {
    this.setState({
      email: event.target.value,
      touched: true,
      errors: {}
    });
  }

  getEmailClass = () => {
    if(this.state.submitted)
      return "";

    if(isEmail(this.state.email))
    {
        return this.state.touched ? "is-valid": "";
    }
    else
    {
        return this.state.touched ? "is-invalid" : "";
    }
  }

  onSubmit = (event) => {
    event.preventDefault();

    var state = this.state;

    if(isEmail(this.state.email))
    {
      state.loading = true;
      state.submitted = true;
      this.setState(state);

      fetch(auth.prepareURL(process.env.REACT_APP_API_URL_FORGET_PASSWORD),
            auth.getRequestInit('post', {
              email: this.state.email,
              language: i18n.language
            }))
      .then(async res => {
        return await res.json();
      })
      .then(data => {
        state.loading = false;
        if(data.errors)
        {
          state.errors = data.errors;
        }
        else
        {
          state.confirmed = true;
        }
        this.setState(state);
      })
      .catch(err => {
      });
    }
    else
    {
      state.errors.email = "Login.errors.email_not_valid";
      state.errors.submitted = true;
      this.setState(state);
    }
  }

  render() {
    const { t, show } = this.props;
    const { loading, confirmed, errors, email} = this.state;
    if(confirmed)
    {
      return (
        <CModal
              show={show}
              onClose={this.props.closeForgetPassword}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton>{t("Login.titles.forgot_password")}</CModalHeader>
              <CModalBody>
                <CAlert className="alert-success fade show center-block" role="alert">
                    {renderHTML(t("Login.msgs.password_forgotten_successfully"))}
                </CAlert>
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={this.props.closeForgetPassword}
                >{t("General.buttons.close")}</CButton>
              </CModalFooter>
            </CModal>
      );
    }
    else
    {
      return (
        <CModal
              show={show}
              onClose={this.props.closeForgetPassword}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton>{t("Login.titles.forgot_password")}</CModalHeader>
              <CModalBody>
              <CForm onSubmit={this.onSubmit}>
                  <CInputGroup className="mb-3">
                    <CInputGroupPrepend>
                      <CInputGroupText>
                        {t("Login.labels.email")}
                      </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput type="text"
                      placeholder="..."
                      className={this.getEmailClass()}
                      name="email"
                      value={email}
                      onChange={this.handleInputChange}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                  </CInputGroup>
                  <CRow>
                    <CCol xs="3"></CCol>
                    <CCol xs="9" className="text-center">
                      {errors.email &&
                        <CAlert className="alert-danger fade show" role="alert">{t(errors.email)}</CAlert>
                      }
                    </CCol>
                  </CRow>
                </CForm>
              </CModalBody>
              <CModalFooter>
                {loading
                ? <CSpinner animation="border" variant="primary" />
                : <CButton color="primary" type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                }
                <CButton
                  color="secondary"
                  onClick={this.props.closeForgetPassword}
                >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
            </CModal>
      );
    }
  }
}


ForgetPassword.propTypes = propTypes;
ForgetPassword.defaultProps = defaultProps;


export default withTranslation()(ForgetPassword);
