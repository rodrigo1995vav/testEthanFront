import React, { Component } from 'react';

import {
  CButton,
  CCard,CCardBody,
  CCol,
  CInput,
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

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Goals extends Component {
  constructor(props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      values: {
        item: "",
        priority: "p1"
      },
      errors: [],
      edit: false,
    }
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
        priority: "p1"
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

  addItem = () => {
    var state = this.state;
    var items = this.props.goals;

    if(state.values.item.match(/[A-Za-z0-9]+/))
    {
      if(state.edit !== false)
      {
        items[state.edit].item = state.values.item;
        items[state.edit].priority = state.values.priority;
      }
      else
      {
        items.push({
          item: state.values.item,
          priority: state.values.priority,
        });
      }
      this.props.setGoals(items);

      state.values.priority = "p1";
      state.values.item = "";
      state.edit = false;
      state.errors = [];

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
      priority: this.props.goals[index].priority,
      item: this.props.goals[index].item
    }
    this.setState(state);
  }

  deleteItem = (index) => {
    var items = this.props.goals;
    items.splice(index,1);
    this.props.setGoals(items);
  }

  render() {
    const {t, goals} = this.props;
    const {values, errors, edit} = this.state;

    return (
            <>
                {goals.length > 0
                  ? <CCard>
                    <CCardBody>
                            {goals.map((item, index) => (
                                  <CRow key={"GoalsRow-"+ index} style={{background: "whitesmoke", padding: "5px", marginBottom: "5px"}}>
                                    {edit === index
                                      ?
                                        <CInputGroup className="mb-1 ml-4">
                                          <CInput
                                              type="text"
                                              name="item"
                                              placeholder={t("Goals.labels.edit_item")}
                                              value={values.item}
                                              autoComplete="off"
                                              onChange={this.handleInputChange}
                                              maxLength="100"
                                              size="sm"
                                              className={errors.item ? "is-invalid col-8" : " col-8"}
                                          />
                                          <CSelect
                                              name="priority"
                                              custom
                                              className="text-left col-2 ml-1"
                                              size="sm"
                                              value={values.priority}
                                              onChange={this.handleInputChange}
                                            >
                                              <option value="p1">{t("Goals.labels.p1")}</option>
                                              <option value="p3">{t("Goals.labels.p3")}</option>
                                              <option value="p5">{t("Goals.labels.p5")}</option>
                                            </CSelect>
                                            <CButton color="primary" size="sm" onClick={this.addItem} className="ml-3"  disabled={values.item.match(/[0-9A-Za-z]{2}/) ? false : true}>
                                            {t("General.buttons.update")}
                                            </CButton>
                                        </CInputGroup>
                                      :
                                        <>
                                          <CCol className="col-1 font-weight-bold">
                                            {index+1}
                                          </CCol>
                                          <CCol className="col-2">
                                            <CBadge color={meetingsHelper.getGoalClass(item.priority)}>{t("Goals.labels." + item.priority)}</CBadge>
                                          </CCol>
                                          <CCol className="col-6">
                                            {item.item}
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
                  : <hr/>
                }
                {edit === false &&
                <CInputGroup className="mb-1">
                    <CInputGroupPrepend>
                        <CInputGroupText>
                           <CIcon name="cil-task" />
                        </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput
                        type="text"
                        name="item"
                        placeholder={t("Goals.labels.add_item")}
                        value={values.item}
                        autoComplete="off"
                        onChange={this.handleInputChange}
                        maxLength="100"
                        className={errors.item ? "is-invalid" : ""}
                     />
                     <CInputGroupPrepend className="ml-2">
                        <CInputGroupText>
                           {t("Goals.labels.priority")}
                        </CInputGroupText>
                    </CInputGroupPrepend>
                     <CSelect
                        name="priority"
                        custom
                        className="text-left col-2"
                        value={values.priority}
                        onChange={this.handleInputChange}
                      >
                        <option value="p1">{t("Goals.labels.p1")}</option>
                        <option value="p3">{t("Goals.labels.p3")}</option>
                        <option value="p5">{t("Goals.labels.p5")}</option>
                      </CSelect>
                      <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1" disabled={values.item.match(/[0-9A-Za-z]{2}/) ? false : true}>
                      {t("General.buttons.add")}
                      </CButton>
                  </CInputGroup>
                  }
              </>
          );
    }
}


Goals.propTypes = propTypes;
Goals.defaultProps = defaultProps;

export default withTranslation()(Goals);
