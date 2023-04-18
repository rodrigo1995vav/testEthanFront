import React, { Component } from 'react';
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CImg,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CSpinner,
  CRow,
  CCardHeader
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import TimezonePicker from 'react-bootstrap-timezone-picker';
import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
import MomentTZ from 'moment-timezone';

import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

import renderHTML from 'react-render-html';
import { withTranslation } from 'react-i18next';

import Language from '../Components/Language';

import _ from 'lodash';

import i18n from './../../services/i18n';

var formsHelper = require('./../../services/Forms');

var auth = require('./../../services/Auth');

const validations = function (values) {
  return {
    name: {
      required: 'Register.errors.company_name_required',
      min: [2,'Register.errors.company_name_length']
    },
    address: {
      required: 'Register.errors.address_required',
      min: [2,'Register.errors.address_length']
    },
    city: {
      required: 'Register.errors.city_required',
      min: [2,'Register.errors.city_length']
    },
    province: {
      required: 'Register.errors.province_required'
    },
    zipCode: {
      required: 'Register.errors.zipCode_required',
      matches: [/^[0-9A-Za-z\-\s]+$/,
                'Register.errors.zipCode_matches']
    },
    country: {
      required: 'Register.errors.country_required'
    },

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
    },
    password: {
      min: [8, 'Login.errors.password_length'],
      matches: [/(?=.*[!#$%&()*+\-./:;<=>?@_{|}])(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).{8,32}/,
              'Login.errors.password_complexity'],
    },
    password2: {
      required: 'Register.errors.password2_required',
      equal: [values.password, 'ResetPassword.errors.password2']
    },
    timezone: {
      required: 'Register.errors.timezone_required'
    }
  }
}

class Register extends Component {
  constructor(props) {
    super(props);

    var temp = Object.values(MomentTZ.tz.names());
    var timezones = {};
    for(var i=0; i < temp.length; i++)
    {
        timezones[temp[i] + " (GMT" + MomentTZ.tz(temp[i]).format('Z') + ")"] = temp[i];
    }

    this.ref = React.createRef();

    this.state = {
      errors: {},
      touched: {},
      values:{
        name: "",
        address: "",
        zipCode: "",
        city: "",
        province: "",
        country: "",
        phone: "",
        firstName: "",
        lastName: "",
        timezone: MomentTZ.tz.guess(),

        email: "",
        password: "",
        password2: ""
      },
      timezones: timezones,
      loading: false,
      submitted: false,
      confirmed: false,
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

      fetch(auth.prepareURL(process.env.REACT_APP_API_URL_COMPANIES_REGISTER),
            auth.getRequestInit('post', state.values))
      .then(async res => {
        this.state.status = res.status;
        return await res.json();
      })
      .then(data => {
        state.loading = false;
        if(this.state.status === 200)
        {
          state.confirmed = true;
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
      this.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      this.setState(state);
    }
  }

  componentDidMount = () => {
  }

  render() {
    const { t } = this.props;
    const { errors, submitted, loading, confirmed, values } = this.state;

    if(confirmed)
    {
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
              <CCol md="9" lg="7" xl="6">
                <CCard className="mx-4 border-success">
                  <CCardHeader><h1>{t("Register.titles.registration_successful")}</h1></CCardHeader>
                  <CCardBody className="p-4">
                    <CAlert className="alert-success fade show center-block" role="alert">
                          {renderHTML(t("Register.msgs.registration_successful"))}
                    </CAlert>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow className="content-center">
              <Language />
            </CRow>
          </CContainer>
        </div>
      );
    }
    else
    {
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
              <CCol md="9" lg="7" xl="6">
                <CCard className="mx-4">
                  <CCardBody className="p-4">
                    <div ref={this.ref}>
                      <CForm name="registrationForm" onSubmit={this.onSubmit}>
                        <h1>{t("Register.titles.register")}</h1>
                        <p className="text-muted">{t("Register.titles.register_desc")}</p>
                        <hr/>
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              {t("Register.labels.company")}
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                            type="text"
                            name="name"
                            placeholder="..."
                            className={this.getFieldClass("name")}
                            value={values.name}
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            required />
                        </CInputGroup>
                        {errors.name && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.name)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                            {t("Register.labels.address")}
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                            type="text"
                            name="address"
                            placeholder="..."
                            className={this.getFieldClass("address")}
                            value={values.address}
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            required />
                        </CInputGroup>
                        {errors.address && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.address)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                            {t("Register.labels.city")}
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                          type="text"
                          name="city"
                          placeholder="..."
                          className={this.getFieldClass("city")}
                          value={values.city}
                          autoComplete="off"
                          onChange={this.handleInputChange}
                          required />
                          <CInputGroupPrepend>
                              <CInputGroupText>
                              {t("Register.labels.zipCode")}
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput
                              type="text"
                              name="zipCode"
                              placeholder="..."
                              className={this.getFieldClass("zipCode")}
                              value={values.zipCode}
                              autoComplete="off"
                              onChange={this.handleInputChange}
                              required />
                        </CInputGroup>
                        {errors.city && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.city)}</CAlert>
                        }
                        {errors.zipCode && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.zipCode)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                                <CInputGroupText>
                                  <CIcon name="cil-globe-alt" />
                                </CInputGroupText>
                              </CInputGroupPrepend>
                              <CountryDropdown
                              className={this.getFieldClass("country") + " form-control"}
                              name="country"
                              defaultOptionLabel={t("Register.labels.country")}
                              value={values.country}
                              onChange={(value => this.onChange("country", value))}
                              required />
                        </CInputGroup>
                        {errors.country && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.country)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                                <CInputGroupText>
                                {t("Register.labels.province")}
                                </CInputGroupText>
                              </CInputGroupPrepend>
                            <RegionDropdown
                                className={this.getFieldClass("province") + " form-control"}
                                name="province"
                                defaultOptionLabel={t("Register.labels.province_select")}
                                country={values.country}
                                value={values.province}
                                onChange={(value => this.onChange("province", value))}
                                required />
                        </CInputGroup>
                        {errors.province && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.province)}</CAlert>
                        }
                        <hr/>
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
                            required />
                          <CInput
                            type="text"
                            name="lastName"
                            placeholder={t("Register.labels.lastName")}
                            className={this.getFieldClass("lastName")}
                            value={values.lastName}
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            required />
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
                            className={this.getFieldClass("email")}
                            value={values.email}
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            required />
                        </CInputGroup>
                        {errors.email && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.email)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-lock-locked" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                            type="password"
                            name="password"
                            placeholder={t("Register.labels.password")}
                            className={this.getFieldClass("password")}
                            value={values.password}
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            required />
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
                          <CInput
                            type="password"
                            name="password2"
                            placeholder={t("Register.labels.password2")}
                            className={this.getFieldClass("password2")}
                            value={values.password2}
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            required/>
                        </CInputGroup>
                        {errors.password2 && submitted &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.password2)}</CAlert>
                        }
                        <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-clock" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <TimezonePicker
                              absolute = {true}
                              defaultValue = {values.timezone}
                              placeholder= {t("Register.labels.timezone")}
                              className={this.getFieldClass("timezone")}
                              onChange= {(value => this.onChange("timezone", value))}
                              timezones={this.state.timezones}
                              style={{width: "90%"}}
                            />
                        </CInputGroup>
                        {errors.timezone && submitted &&
                                <CAlert className="alert-danger fade show" role="alert">{t(errors.timezone)}</CAlert>
                        }
                        <hr/>
                        {loading
                          ? <div className="d-flex justify-content-center"><CSpinner animation="spinner-grow text-primary" /></div>
                          : <CButton color="primary" type="submit" className="px-4" block id="test">{t("General.buttons.submit")}</CButton>
                        }
                      </CForm>
                    </div>
                  </CCardBody>
                </CCard>
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
}

export default withTranslation()(Register);
