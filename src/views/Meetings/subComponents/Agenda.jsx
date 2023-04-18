import React, { Component } from 'react';

import {
  CAlert,
  CBadge,
  CButton,
  CCard,CCardHeader,CCardBody,
  CCol,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CSelect
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


class Agenda extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        item: "",
        duration: 5
      },
      errors: [],
      edit: false,
    }
    this.onDragEnd = this.onDragEnd.bind(this);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.getAgendaColor = this.getAgendaColor.bind(this);
    this.getItemStyle = this.getItemStyle.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    return null;
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.initializeComponents)
    {
      var state = this.state;
      state.values = {
        item: "",
        duration: 5
      };
      state.errors = [];
      state.edit = false;
      this.props.componentsInitialized();
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    state.errors[name] = false;
    this.setState(state);
  }

  getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: 5,
    margin: `0 0 5px 0`,
    background: isDragging ? "beige" : "whitesmoke",
    ...draggableStyle
  });

  addItem = () => {
    var state = this.state;
    var items = this.props.agenda;
    var agenda_duration = this.props.agenda_duration;
    var meeting_duration = this.props.meeting_duration;

    if(state.values.item.match(/[A-Za-z0-9]+/))
    {
      var temp = state.edit !== false ? _.toInteger(items[state.edit].duration) : 0;
      if( (agenda_duration + _.toInteger(state.values.duration) - temp) <= meeting_duration )
      {
        if(temp !== 0)
        {
          items[state.edit].content = state.values.item;
          items[state.edit].duration = state.values.duration;
        }
        else
        {
          items.push({
            duration: state.values.duration,
            content: state.values.item
          });
        }

        agenda_duration +=  _.toInteger(state.values.duration) - temp;
        this.props.setAgenda(agenda_duration, items);

        state.values.duration = 5;
        state.values.item = "";
        state.edit = false;
        state.errors = [];
      }
      else
      {
        state.errors.duration = true;
      }
    }
    else{
      state.errors.item = true;
    }
    this.setState(state);
  }

  editItem = (index) => {
    var state = this.state;
    state.edit = index;
    state.values = {
      duration: this.props.agenda[index].duration,
      item: this.props.agenda[index].content
    }
    this.setState(state);
  }

  deleteItem = (index) => {
    var items = this.props.agenda;
    var agenda_duration = this.props.agenda_duration;

    agenda_duration -= _.toInteger(items[index].duration);
    items.splice(index,1);
    this.props.setAgenda(agenda_duration, items);
  }
  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    var items = this.props.agenda;
    var agenda_duration = this.props.agenda_duration;
    items = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    this.props.setAgenda(agenda_duration, items);
  }

  getAgendaColor = () => {
    var agenda_duration = this.props.agenda_duration;
    var meeting_duration = this.props.meeting_duration;
    if(agenda_duration === meeting_duration)
    {
        return "alert-success";
    }
    return (agenda_duration < meeting_duration) ? "alert-warning": "alert-danger";
  }
  render() {
    const {t, meeting_duration, agenda_duration, agenda} = this.props;
    const {values, errors, edit} = this.state;

    return (
            <>
                {agenda.length > 0
                  ? <CCard>
                    <CCardHeader className={this.getAgendaColor()}>{t("Agenda.labels.scheduled") + ": "+ meetingsHelper.convertDuration(agenda_duration) + " / " + meetingsHelper.convertDuration(meeting_duration)}</CCardHeader>
                    <CCardBody>
                      <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable-agenda">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                            {agenda.map((item, index) => (
                              <Draggable key={"item-" + index} draggableId={"item-" + index} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={this.getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                  )}
                                >
                                  <CRow>
                                    {edit === index
                                      ?
                                        <>
                                          <CInputGroup className="mb-1 ml-4">
                                              <CInput
                                                  type="text"
                                                  name="item"
                                                  placeholder={t("Agenda.labels.edit_item")}
                                                  value={values.item}
                                                  autoComplete="off"
                                                  onChange={this.handleInputChange}
                                                  maxLength="100"
                                                  size="sm"
                                                  className={errors.item ? "is-invalid col-8" : " col-8"}
                                              />
                                              <CSelect
                                                  name="duration"
                                                  custom
                                                  size="sm"
                                                  className="text-left col-2 ml-2"
                                                  value={values.duration}
                                                  onChange={this.handleInputChange}
                                                >
                                                  <option value="5">5M</option>
                                                  <option value="10">10M</option>
                                                  <option value="15">15M</option>
                                                  <option value="20">20M</option>
                                                  <option value="25">25M</option>
                                                  <option value="30">30M</option>
                                                  <option value="35">35M</option>
                                                  <option value="40">40M</option>
                                                  <option value="45">45M</option>
                                                  <option value="50">50M</option>
                                                  <option value="55">55M</option>
                                                  <option value="60">1H</option>
                                                  <option value="65">1H05M</option>
                                                  <option value="70">1H10M</option>
                                                  <option value="75">1H15M</option>
                                                  <option value="80">1H20M</option>
                                                  <option value="85">1H25M</option>
                                                  <option value="90">1H30M</option>
                                                </CSelect>
                                                <CButton color="primary" size="sm" onClick={this.addItem} className="ml-3">
                                                {t("General.buttons.update")}
                                                </CButton>
                                          </CInputGroup>
                                          {errors.duration &&
                                            <CAlert className="alert-danger ml-4 col-11 font-sm">{t("Agenda.errors.agenda_duration_update")}</CAlert>
                                          }
                                        </>
                                      :
                                        <>
                                          <CCol className="col-1 font-weight-bold">
                                              {index+1}
                                          </CCol>
                                          <CCol className="col-2">
                                            <CBadge color="info">{meetingsHelper.convertDuration(item.duration)}</CBadge>
                                          </CCol>
                                          <CCol className="col-6">
                                            {item.content}
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
                                </div>
                              )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </CCardBody>
                  </CCard>
                  : <hr/>
                }
                {edit === false &&
                <>
                  <CInputGroup className="mb-1">
                      <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-speech" />
                          </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput
                          type="text"
                          name="item"
                          placeholder={t("Agenda.labels.add_item")}
                          value={values.item}
                          autoComplete="off"
                          onChange={this.handleInputChange}
                          maxLength="100"
                          className={errors.item ? "is-invalid" : ""}
                      />
                      <CInputGroupPrepend className="ml-2">
                          <CInputGroupText>
                            {t("Agenda.labels.duration")}
                          </CInputGroupText>
                      </CInputGroupPrepend>
                      <CSelect
                          name="duration"
                          custom
                          className="text-left col-2"
                          value={values.duration}
                          onChange={this.handleInputChange}
                        >
                          <option value="5">5M</option>
                          <option value="10">10M</option>
                          <option value="15">15M</option>
                          <option value="20">20M</option>
                          <option value="25">25M</option>
                          <option value="30">30M</option>
                          <option value="35">35M</option>
                          <option value="40">40M</option>
                          <option value="45">45M</option>
                          <option value="50">50M</option>
                          <option value="55">55M</option>
                          <option value="60">1H</option>
                          <option value="65">1H05M</option>
                          <option value="70">1H10M</option>
                          <option value="75">1H15M</option>
                          <option value="80">1H20M</option>
                          <option value="85">1H25M</option>
                          <option value="90">1H30M</option>
                        </CSelect>
                        <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1">
                        {t("General.buttons.add")}
                        </CButton>
                  </CInputGroup>
                  {errors.duration &&
                    <CAlert className="alert-danger font-sm">{t("Agenda.errors.agenda_duration_add")}</CAlert>
                  }
              </>
                }
            </>
          );
    }
}

Agenda.propTypes = propTypes;
Agenda.defaultProps = defaultProps;

export default withTranslation()(Agenda);
