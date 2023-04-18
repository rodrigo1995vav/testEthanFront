import React, { Component } from 'react';

import {
  CButton,
  CCard,CCardBody,
  CCol,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CSelect,
  CBadge
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from "lodash";

//React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

var auth = require('./../../../services/Auth');
var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Attendees extends Component {
  constructor(props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getColleagues = this.getColleagues.bind(this);

    this.state = {
      values: {
        email: "",
        type: "guest",
        presence: "required"
      },
      edit: false,
      colleagues: [],
      selectableColleagues: []
    }

    this.getColleagues();
  }

  static getDerivedStateFromProps(props, state) {
    return null;
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.initializeComponents)
    {
      var state = this.state;
      state.values = {
        email: "",
        type: "guest",
        presence: "required"
      };
      state.edit = false;
      this.props.componentsInitialized();
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    this.setState(state);
  }

  onChange = (name, value) => {
    this.handleInputChange({target: {name: name, value: value}});
  }

  addItem = () => {
    var state = this.state;
    var items = this.props.attendees;

    if(state.edit !== false)
    {
        if(!_.isString(state.values.email))
        {
          items[state.edit].email = state.values.email.value;
          items[state.edit].fullName = state.values.email.label;
          items[state.edit].user = state.values.email.id;
        }
        items[state.edit].type = state.values.type;
        items[state.edit].presence = state.values.presence;

    }
    else
    {
          items.push({
            email: state.values.email.value,
            fullName: state.values.email.label,
            user: state.values.email.id,
            type: state.values.type,
            presence: state.values.presence,
          });
    }

    state.selectableColleagues = this.getSelectableColleagues(items, state.colleagues);

    this.props.setAttendees(items);

    state.values.type = "guest";
    state.values.presence = "required";
    state.values.email = "";
    state.edit = false;

    this.setState(state);
  }

  editItem = (index) => {
    var state = this.state;
    var items = _.clone(this.props.attendees);

    state.edit = index;
    state.values = {
      type: this.props.attendees[index].type,
      email: this.props.attendees[index].email,
      presence: this.props.attendees[index].presence
    }

    items.splice(index,1);
    state.selectableColleagues = this.getSelectableColleagues(items, state.colleagues);

    this.setState(state);
  }

  deleteItem = (index) => {
    var items = this.props.attendees;
    var state = this.state;

    items.splice(index,1);
    state.selectableColleagues = this.getSelectableColleagues(items, state.colleagues);

    this.setState(state);
    this.props.setAttendees(items);
  }

  getColleagues(){
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_COLLEAGUES), auth.getRequestInit('get', null))
    .then(async res => {
      state.status = res.status;
      return await res.json();
    })
    .then(data => {
      state.colleagues = data.users;
      state.selectableColleagues = this.getSelectableColleagues(this.props.attendees, state.colleagues);
      this.setState(state);
    })
    .catch(err => {
      console.log(err);
    });
  }

  getSelectableColleagues(attendees, colleagues){
      var participants = [];
      var selectableColleagues = [];

      attendees.map((attendee) => (
        participants.push(attendee.email)
      ));
      for(var i=0; i< colleagues.length; i++){
        var col = colleagues[i];
        if(participants.indexOf(col.email) < 0 )
        {
            selectableColleagues.push({
              value: col.email,
              label: col.fullName,
              id: col.id
            });
        }
      }

      return _.orderBy(selectableColleagues, ['label'],['asc']);
  }

  render() {
    const {t, attendees} = this.props;
    const {values, edit, selectableColleagues} = this.state;
    return (
            <>
                {edit === false &&
                <>
                   <hr/>
                  <CInputGroup className="mb-1">
                      <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                      </CInputGroupPrepend>
                      <Select
                          value={values.email}
                          options={selectableColleagues}
                          placeholder="..."
                          onChange={(value) => this.onChange("email", value)}
                          className="col-6 ml-0 pl-0"
                      />
                      <CSelect
                        name="type"
                        custom
                        className="text-left col-3"
                        value={values.type}
                        onChange={this.handleInputChange}
                      >
                        <option value="guest">{t("Attendees.labels.guest")}</option>
                        <option value="coHost">{t("Attendees.labels.coHost")}</option>
                      </CSelect>
                      <CSelect
                        name="presence"
                        custom
                        className="text-left col-3"
                        value={values.presence}
                        onChange={this.handleInputChange}
                      >
                        <option value="required">{t("Attendees.labels.required")}</option>
                        <option value="optional">{t("Attendees.labels.optional")}</option>
                      </CSelect>
                      <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1" disabled={ (_.isEmpty(values.email) || _.isNull(values.email)) ? true : false}>
                        {t("General.buttons.add")}
                      </CButton>
                  </CInputGroup>
                </>
                }

                {attendees.length > 0 &&
                   <CCard>
                    <CCardBody>
                            {attendees.map((item, index) => (
                                  <CRow key={"AttendeesRow-"+ index} style={{background: "whitesmoke", padding: "5px", marginBottom: "5px"}}>
                                    {edit === index
                                      ?
                                        <>
                                        <CInputGroup className="mb-1 ml-4">
                                            <Select
                                                value={values.email}
                                                options={selectableColleagues}
                                                placeholder="..."
                                                onChange={(value) => this.onChange("email", value)}
                                                className="col-6 ml-0 pl-0"
                                            />
                                            <CSelect
                                              name="type"
                                              custom
                                              className="text-left col-3"
                                              value={values.type}
                                              onChange={this.handleInputChange}
                                            >
                                              <option value="guest">{t("Attendees.labels.guest")}</option>
                                              <option value="coHost">{t("Attendees.labels.coHost")}</option>
                                            </CSelect>
                                            <CSelect
                                              name="presence"
                                              custom
                                              className="text-left col-3"
                                              value={values.presence}
                                              onChange={this.handleInputChange}
                                            >
                                              <option value="required">{t("Attendees.labels.required")}</option>
                                              <option value="optional">{t("Attendees.labels.optional")}</option>
                                            </CSelect>
                                            <CButton color="primary" size="sm" onClick={this.addItem} className="ml-3" disabled={ (_.isEmpty(values.email) || _.isNull(values.email)) ? true : false}>
                                            {t("General.buttons.update")}
                                            </CButton>
                                        </CInputGroup>
                                        </>
                                      :
                                        <>
                                          <CCol className="col-1 font-weight-bold">
                                            {index+1}
                                          </CCol>
                                          <CCol className="col-2">
                                            <CBadge color={meetingsHelper.getAttendeeClass(item.type)}>{t("Attendees.labels." + item.type)}</CBadge>
                                            <CBadge color={meetingsHelper.getRequiredClass(item.presence)}>{t("Attendees.labels." + item.presence)}</CBadge>
                                          </CCol>
                                          <CCol className="col-6 font-smaller">
                                            {item.fullName}
                                          </CCol>
                                          <CCol className="col-3 text-right">
                                            {edit === false &&
                                              <>
                                                <CButton color="primary" size="sm" onClick={(event => this.editItem(index))}>
                                                  <CIcon name="cil-pencil"/>
                                                </CButton>
                                                <CButton color="danger" className="ml-1" size="sm" onClick={(event => this.deleteItem(index))}>
                                                  <CIcon name="cil-x"/>
                                                </CButton>
                                              </>
                                            }
                                          </CCol>
                                        </>
                                    }
                                  </CRow>
                            ))}
                    </CCardBody>
                  </CCard>
                }
              </>
          );
    }
}

Attendees.propTypes = propTypes;
Attendees.defaultProps = defaultProps;

export default withTranslation()(Attendees);
