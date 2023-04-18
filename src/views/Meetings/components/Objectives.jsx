import React, { Component } from 'react';

import {
  CButton,
  CCard,CCardHeader,CCardBody,
  CCol,
  CForm,
  CLabel,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CModal,CModalHeader,CModalBody,CModalFooter,
  CRow,
  CSelect,
  CBadge
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import MomentTZ from 'moment-timezone';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

var auth = require('./../../../services/Auth');
var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Objectives extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.updateCompleted = this.updateCompleted.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      loading: true,
      errors: {},
      edit: false,
      values: {
        item: "",
        priority: "p1",
        completeness: 0
      },
      goals: []
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.show !== this.props.show)
    {
      var state = this.state;
      if(!this.props.show)
      {
        state.loading= true;
        state.errors = {};
        state.edit = false;
        state.goals = [];
        state.values = {
          item: "",
          priority: "p1",
          completed: 0
        };
        this.setState(state);
      }
      else {
        state.errors = {};
        state.loading = false;
        if(!_.isNull(this.props.meeting))
        {
          state.goals = _.clone(this.props.meeting.goals);
        }
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

  addItem = () => {
    var state = this.state;
    var items = state.goals;

    if(state.values.item.match(/[A-Za-z0-9]+/))
    {
      if(state.edit !== false)
      {
        items[state.edit].item = state.values.item;
        items[state.edit].priority = state.values.priority;
        items[state.edit].additional = true;
        items[state.edit].completed= state.values.completed;
      }
      else
      {
        items.push({
          item: state.values.item,
          priority: state.values.priority,
          additional: true,
          completed: state.values.completed
        });
      }

      state.goals = _.orderBy(items, ['priority', 'item'], ['desc', 'asc']);

      state.values.priority = "p1";
      state.values.item = "";
      state.values.completed = "0";
      state.edit = false;
      state.errors = [];
      this.setState(state);
    }
    else{
      state.errors.item = true;
    }
    this.setState(state);
  }

  editItem = (index) => {
    var state = this.state;
    var items = state.goals;
    state.edit = index;
    state.values = {
      priority: items[index].priority,
      item: items[index].item,
      completed: items[index].completed
    }
    this.setState(state);
  }

  deleteItem = (index) => {
    var state = this.state;
    var items = state.goals;
    items.splice(index,1);
    state.goals = items;
    this.setState(state);
  }

  updateCompleted = (index, value) => {
    var state = this.state;
    var items = state.goals;
    items[index].completed = value;
    this.setState(state);
  }

  onSubmit = (event) => {
    event.preventDefault();
    var state = this.state;

    state.loading = true;
    this.setState(state);

    var meeting = _.clone(this.props.meeting);
    meeting.goals = state.goals;

    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_UPDATE) + meeting._id, auth.getRequestInit('put', meeting))
    .then(async res => {
      if(res.status === 200){
        this.props.closeMeetingObjectives();
        this.props.notify('success', 'Objectives.msgs.meeting_objectives_updated_successfully');
        this.props.fetchMeetings(false,
                                true,
                                false);
      }
      this.setState(state);
      return await res.json();
    })
    .catch(err => {
    });
  }

  render() {
    const {t, show, meeting, timezone} = this.props;
    const {loading, errors, values, goals, edit} = this.state;
      return (
        <CModal
              show={show}
              onClose={this.props.closeMeetingObjectives}
              centered={true}
              fade={true}
              size="lg"
            >
              <CModalHeader closeButton>{t("Objectives.titles.manage_meeting_objectives")}</CModalHeader>
              <CModalBody>
              {loading
                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                :
                 <CForm onSubmit={this.onSubmit}>
                    <CRow>
                      <CCol className="col-12">
                        <CCard>
                          <CCardHeader>
                            <CLabel className="font-weight-bold">{meeting.subject}</CLabel>
                            <CLabel className="ml-4 mr-2"><CIcon name="cil-calendar" className="mr-1" size="sm"/> {MomentTZ(meeting.datetime).tz(timezone).format('LL')}</CLabel>
                            <CLabel className="mr-2"><CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(meeting.datetime).tz(timezone).format('LT')} - {MomentTZ(meeting.datetime).tz(timezone).add(meeting.duration,"minutes").format('LT')} ({meetingsHelper.convertDuration(meeting.duration)})</CLabel>
                          </CCardHeader>
                          <CCardBody>
                            {goals.map((item, index) => (
                                    <CRow key={"GoalsRow-"+ index} style={{background: "whitesmoke", padding: "5px", marginBottom: "5px"}}>
                                      {edit === index
                                        ?<>
                                        <CInputGroup>
                                            <CInput
                                                type="text"
                                                name="item"
                                                placeholder={t("Objectives.labels.edit_item")}
                                                value={values.item}
                                                autoComplete="off"
                                                onChange={this.handleInputChange}
                                                maxLength="100"
                                                className={errors.item ? "is-invalid" : ""}
                                            />
                                            <CSelect
                                                name="priority"
                                                custom
                                                className="text-left col-3 ml-1"
                                                value={values.priority}
                                                onChange={this.handleInputChange}
                                              >
                                                <option value="p1">{t("Goals.labels.priority") + "-" + t("Goals.labels.p1")}</option>
                                                <option value="p3">{t("Goals.labels.priority") + "-" + t("Goals.labels.p3")}</option>
                                                <option value="p5">{t("Goals.labels.priority") + "-" + t("Goals.labels.p5")}</option>
                                              </CSelect>
                                              <CSelect
                                                name="completed"
                                                custom
                                                className="text-left col-3 ml-1"
                                                value={values.completed}
                                                onChange={this.handleInputChange}
                                              >
                                                <option value="0">{t("Objectives.labels.completed")}-0%</option>
                                                <option value="25">{t("Objectives.labels.completed")}-25%</option>
                                                <option value="50">{t("Objectives.labels.completed")}-50%</option>
                                                <option value="75">{t("Objectives.labels.completed")}-75%</option>
                                                <option value="100">{t("Objectives.labels.completed")}-100%</option>
                                              </CSelect>

                                              <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1">
                                              {t("General.buttons.update")}
                                              </CButton>
                                          </CInputGroup>
                                          </>
                                        :
                                          <>
                                            <CCol className="col-1 font-weight-bold">
                                              {index+1}
                                            </CCol>
                                            <CCol className="col-1">
                                              <CBadge color={meetingsHelper.getGoalClass(item.priority)}>{t("Goals.labels." + item.priority)}</CBadge>
                                            </CCol>
                                            <CCol className="col-1">
                                              <CBadge color="info">{item.completed}%</CBadge>
                                            </CCol>
                                            <CCol className="col-6">
                                              {item.item}
                                              {item.additional &&
                                              <CBadge color="light" className="ml-1">{t("Objectives.labels.new")}</CBadge>
                                              }
                                            </CCol>
                                            <CCol className="col-3 text-right">
                                              {edit === false && item.additional &&
                                                <>
                                                  <CButton color="primary" size="sm" onClick={(event => this.editItem(index))}>
                                                    <CIcon name="cil-pencil"/>
                                                  </CButton>
                                                  <CButton color="danger" className="ml-1" size="sm" onClick={(event => this.deleteItem(index))}>
                                                    <CIcon name="cil-x"/>
                                                  </CButton>
                                                </>
                                              }
                                              {!item.additional  &&
                                                <CSelect
                                                    custom
                                                    size="sm"
                                                    className="text-left ml-1"
                                                    value={item.completed}
                                                    onChange={event => this.updateCompleted(index ,event.target.value)}
                                                  >
                                                    <option value="0">{t("Objectives.labels.completed")}-0%</option>
                                                    <option value="25">{t("Objectives.labels.completed")}-25%</option>
                                                    <option value="50">{t("Objectives.labels.completed")}-50%</option>
                                                    <option value="75">{t("Objectives.labels.completed")}-75%</option>
                                                    <option value="100">{t("Objectives.labels.completed")}-100%</option>
                                                  </CSelect>
                                              }
                                            </CCol>
                                          </>
                                      }
                                    </CRow>
                              ))}

                          </CCardBody>
                        </CCard>
                        <hr/>
                        {edit === false &&
                        <>
                          <CInputGroup className="mb-1">
                              <CInputGroupPrepend>
                                  <CInputGroupText>
                                    <CIcon name="cil-task" />
                                  </CInputGroupText>
                              </CInputGroupPrepend>
                              <CInput
                                  type="text"
                                  name="item"
                                  placeholder={t("Objectives.labels.add_item")}
                                  value={values.item}
                                  autoComplete="off"
                                  onChange={this.handleInputChange}
                                  maxLength="100"
                                  className={errors.item ? "is-invalid" : ""}
                              />
                              <CSelect
                                  name="priority"
                                  custom
                                  className="text-left col-3 ml-1"
                                  value={values.priority}
                                  onChange={this.handleInputChange}
                                >
                                  <option value="p1">{t("Goals.labels.priority") + "-" + t("Goals.labels.p1")}</option>
                                  <option value="p3">{t("Goals.labels.priority") + "-" + t("Goals.labels.p3")}</option>
                                  <option value="p5">{t("Goals.labels.priority") + "-" + t("Goals.labels.p5")}</option>
                                </CSelect>
                              <CSelect
                                  name="completed"
                                  custom
                                  className="text-left col-3 ml-1"
                                  value={values.completed}
                                  onChange={this.handleInputChange}
                                >
                                  <option value="0">{t("Objectives.labels.completed")}-0%</option>
                                  <option value="25">{t("Objectives.labels.completed")}-25%</option>
                                  <option value="50">{t("Objectives.labels.completed")}-50%</option>
                                  <option value="75">{t("Objectives.labels.completed")}-75%</option>
                                  <option value="100">{t("Objectives.labels.completed")}-100%</option>
                                </CSelect>

                                <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1">
                                {t("General.buttons.add")}
                                </CButton>
                            </CInputGroup>
                            </>
                          }
                      </CCol>
                    </CRow>
                  </CForm>
                }
              </CModalBody>
              {loading === false &&
                <CModalFooter>
                  <CButton color="primary" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeMeetingObjectives}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
              }
            </CModal>
      );
    }
}

Objectives.propTypes = propTypes;
Objectives.defaultProps = defaultProps;


export default withTranslation()(Objectives);
