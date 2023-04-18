import React, { Component } from 'react';

import {
  CButton,
  CCard,CCardHeader,CCardBody,
  CCol,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CModal,CModalHeader,CModalBody,CModalFooter,
  CRow,
  CSelect,
  CNav,CNavItem,CNavLink,
  CTabs,CTabContent,CTabPane, CBadge
} from '@coreui/react';
import {FiUsers} from 'react-icons/fi';
import {RiArtboard2Line} from 'react-icons/ri';
import {
  CIcon
} from '@coreui/icons-react';
import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

import { CTextarea } from '@coreui/react/lib/CInput';

import Members from './../subComponents/Members';
import Board from './../subComponents/Board';

var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Project extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.componentsInitialized = this.componentsInitialized.bind(this);
    this.setBoard = this.setBoard.bind(this);
    this.setMembers = this.setMembers.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      loading: true,
      values: {
        name: "",
        description: "",
        reference: "",
        type: "",
        members: [],
        board: [],
        initializeComponents: false,
      }
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.show !== this.props.show)
    {
      var state = this.state;
      if(!this.props.show)
      {
        state.loading= true;
        state.values = {
          name: "",
          description: "",
          reference: "",
          type: "",
          members: [],
          board: []
        };
        this.setState(state);
      }
      else {
        state.errors = {};

        if(!_.isNull(this.props.project))
        {
          var project = this.props.project;
          _.forEach(project, function(value, key) {
                if (_.indexOf(['name', 'description', 'reference', 'type'], key) >= 0)
                    state.values[key] = value;
          });

          state.values.members = _.clone(project.members);
          state.values.board = _.clone(project.board);

          state.loading = false;
          this.setState(state);
        }
        else
        {
          state.loading = false;
          this.setState(state);
        }
      }
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

  componentsInitialized = () => {
    var state = this.state;
    state.values.initializeComponents = false;
    this.setState(state);
  }

  setMembers = (items) => {
    var state = this.state;
    state.values.members = _.orderBy(items, ['fullName'], ['asc']);
    this.setState(state);
  }

  setBoard = (items) => {
    var state = this.state;
    state.values.board = items;
    this.setState(state);
  }

  async onSubmit (event) {
    event.preventDefault();
    var state = this.state;
    state.loading = true;
    this.setState(state);

    var msg = _.isNull(this.props.project) ? "Project.msgs.project_created_successfully" : "Project.msgs.project_updated_successfully";
    var res = await fetch(auth.prepareURL((_.isNull(this.props.project) ? process.env.REACT_APP_API_URL_PROJECTS_INSERT:process.env.REACT_APP_API_URL_PROJECTS_UPDATE + this.props.project._id )),
                      auth.getRequestInit(_.isNull(this.props.project) ? 'post' : 'put', state.values));

    var status = res.status;
    var data = await res.json();
    if(status === 200)
    {
      this.props.closeProject();
      this.props.notify('success', msg);
      this.props.fetchProjects();
    }
    else
    {
      state.loading = false;
      state.errors = data.errors;
      this.setState(state);
    }
  }

  render() {
    const {t, show, project} = this.props;
    const {loading, values} = this.state;

      return (
        <CModal
              show={show}
              onClose={this.props.closeProject}
              centered={true}
              fade={true}
              size="xl"
            >
              <CModalHeader closeButton>
                {_.isNull(project) ? t("Project.titles.new_project"): t("Project.titles.edit_project")}
                </CModalHeader>
              <CModalBody>
              {loading
                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                :
                 <CForm onSubmit={this.onSubmit}>
                    <CRow>
                      <CCol xs="12" sm="5">
                        <CCard className="overflow-auto"  style={{height: '270px'}}>
                          <CCardHeader>
                            {t("Project.titles.general_information")}
                          </CCardHeader>
                          <CCardBody>
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-bookmark" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                      type="text"
                                      name="name"
                                      placeholder={t("Project.labels.name")}
                                      className={values.name.match(/[0-9A-Za-z]{2}/) ? "is-valid" : "is-invalid"}
                                      value={values.name}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      />
                              </CInputGroup>
                              <CInputGroup className="mb-3">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-tags" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                      type="text"
                                      name="reference"
                                      placeholder={t("Project.labels.reference")}
                                      value={values.reference}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      />
                              </CInputGroup>
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-comment-square" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CTextarea
                                      name="description"
                                      placeholder={t("Project.labels.description")}
                                      value={values.description}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      />
                              </CInputGroup>
                              <CInputGroup>
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-layers" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSelect
                                      name="type"
                                      custom
                                      value={values.type}
                                      onChange={this.handleInputChange}
                                      className="text-left"
                                      >
                                        <option value="">{t("Project.labels.type")}</option>
                                        <option value="development">{t("Project.labels.development")}</option>
                                        <option value="infrastructure">{t("Project.labels.infrastructure")}</option>
                                        <option value="innovation">{t("Project.labels.innovation")}</option>
                                        <option value="management">{t("Project.labels.management")}</option>
                                        <option value="manufacturing">{t("Project.labels.manufacturing")}</option>
                                        <option value="migration">{t("Project.labels.migration")}</option>
                                        <option value="optimization">{t("Project.labels.optimization")}</option>
                                        <option value="other">{t("Project.labels.other")}</option>
                                        <option value="research_development">{t("Project.labels.research_development")}</option>
                                    </CSelect>
                              </CInputGroup>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol xs="12" sm="7">
                        <CCard>
                          <CCardBody className="p-0">
                            <CTabs fade={false}>
                              <CNav variant="tabs" className='nav-underline nav-underline-primary nav-justified'>
                                <CNavItem>
                                  <CNavLink>
                                    <FiUsers className="mr-2"/>
                                    {t("Project.titles.members")}
                                    <CBadge color="primary" className="ml-1">{values.members.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                  <CNavLink>
                                    <RiArtboard2Line className="mr-2" />
                                    {t("Project.titles.board")}
                                    <CBadge color="primary" className="ml-1">{values.board.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                              </CNav>
                              <CTabContent>
                                <CTabPane className="p-2 overflow-auto" style={{height: '320px'}}>
                                  <Members
                                    members={values.members}
                                    setMembers={this.setMembers}
                                    initializeComponents={values.initializeComponents}
                                    componentsInitialized={this.componentsInitialized}
                                  />
                                </CTabPane>
                                <CTabPane className="p-2 overflow-auto" style={{height: '320px'}}>
                                  <Board
                                    board={values.board}
                                    setBoard={this.setBoard}
                                    initializeComponents={values.initializeComponents}
                                    componentsInitialized={this.componentsInitialized}
                                  />
                                </CTabPane>

                              </CTabContent>
                            </CTabs>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                  </CForm>
                }
              </CModalBody>
              {loading === false &&
                <CModalFooter>
                  <CButton color="primary" type="submit" disabled={values.name.match(/[0-9A-Za-z]{2}/) ? false: true} className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeProject}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
              }
            </CModal>
      );
  }
}

Project.propTypes = propTypes;
Project.defaultProps = defaultProps;

export default withTranslation()(Project);
