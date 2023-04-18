import React, { Component } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CDataTable,
  CLabel,
  CRow
} from '@coreui/react';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";
import i18n from 'i18next';
import MomentTZ from 'moment-timezone';
import Moment from 'moment';

import _ from 'lodash';

import {GrProjects} from 'react-icons/gr';

import Project from './components/Project';

var auth = require('./../../services/Auth');


const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Projects extends Component {
  constructor(props) {
    super(props);
    this.addProject = this.addProject.bind(this);
    this.closeProject = this.closeProject.bind(this);
    this.editProject.bind(this);
    this.deleteProject.bind(this);
    this.deleteProjectConfirmed.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);

    this.state = {
      delete: [],
      showProject: false,
      project: null,
      projects: [],
      language: i18n.language,
      loading: true
    }
  }

  static getDerivedStateFromProps(props, state) {
    if(props.i18n.language !== state.language)
    {
      state.language = props.i18n.language;
      Moment.locale(i18n.language !== "en" ? i18n.language : "en-gb");
      return state;
    }
    return null;
  }

  componentDidMount() {
    this.fetchProjects()
  }

  addProject = (event) => {
    this.setState({
      showProject: true
    });
  }

  closeProject = (event) => {
    this.setState({
      showProject: false,
      project: null
    })
  }

  editProject = (item) => {
    this.setState({
      showProject: true,
      project: item
    });
  }

  deleteProject = (item, index) => {
    var state = this.state;
    const position = state.delete.indexOf(index);
    (position !== -1) ? state.delete.splice(position, 1) : state.delete.push(index);
    this.setState(state);
  }

  deleteProjectConfirmed = (item, index) => {
    var state = this.state;

    const position = state.delete.indexOf(index);
    (position !== -1) ? state.delete.splice(position, 1) : state.delete.push(index);

    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_PROJECTS_DELETE + item._id), auth.getRequestInit('delete', null))
    .then(async res => {
      state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(state.status === 200)
      {
        this.props.notify('success', 'Projects.msgs.project_deleted_successfully');
        this.setState(state);
        this.fetchProjects();
      }
    })
    .catch(err => {});
  }

  fetchProjects = () => {
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_PROJECTS_LIST), auth.getRequestInit('post', null))
    .then(async res => {
      this.state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(this.state.status === 200)
      {
        state.projects = data.projects;
        state.loading = false
        this.setState({state});
      }
    })
    .catch(err => {
    });
  }

  render() {
    const {t, timezone} = this.props;
    const {projects, loading} = this.state;

    const fields = [
      { key: 'name',
        label: t("Projects.labels.name"),
        _classes: 'font-weight-bold'
      },
      { key: 'reference',
        label: t("Projects.labels.reference")
      },
      { key: 'created',
        label: t("Projects.labels.created"),
        _classes: 'd-md-down-none'
      },
      { key: 'members',
        label: t("Projects.labels.members"),
        sorter: false,
        filter: false
      },
      {
        key: 'menu',
        label: '',
        _style: {width: '15%'},
        sorter: false,
        filter: false
      }
  ];

    return (
      <div className="animated fadeIn">
            <CCard>
              <CCardHeader className="font-weight-bold">
              <GrProjects className="mr-3" />
              <CLabel className="font-lg">{t("Projects.titles.projects")}</CLabel>
              <div className="card-header-actions">
              <CButton block color="primary" shape="circle" size="sm" variant="outline" onClick={() => this.addProject()}>{t("Projects.labels.new_project")}</CButton>
              </div>
              </CCardHeader>
              <CCardBody className=" p-0">
              <CDataTable
                  items={projects}
                  fields={fields}
                  columnFilter
                  loading={loading}
                  responsive
                  noItemsView={{noResults: t("General.labels.no_result"), noItems:  t("General.labels.empty")}}
                  itemsPerPage={_.toInteger(process.env.REACT_APP_DATA_TABLE_ITEM_PER_PAGE)}
                  hover
                  sorter
                  striped
                  pagination={{ doubleArrows: false, align: 'center' }}

                  scopedSlots = {{
                      'name':
                      (item)=>(
                        <td>
                            {item.name}
                        </td>
                      ),
                      'reference':
                      (item)=>(
                        <td>
                            {item.reference}
                        </td>
                      ),
                      'created':
                      (item)=>(
                        <td className="d-md-down-none">
                            {MomentTZ(item.created).tz(timezone).format('LL-LT')}
                        </td>
                      ),
                      'members':
                      (item)=>(
                        <td>
                            {item.members.length}
                        </td>
                      ),
                      'menu':
                        (item, index)=>{
                          return (
                              <td className="py-2 text-center">
                                <CButton
                                  color="primary"
                                  variant="outline"
                                  shape="circle"
                                  size="sm"
                                  onClick={()=>{this.editProject(item)}}
                                >
                                  {t("General.buttons.edit")}
                                </CButton>
                                {!this.state.delete.includes(index) &&
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    shape="circle"
                                    size="sm"
                                    className=" ml-2"
                                    onClick={()=>{this.deleteProject(item,index)}}
                                  >
                                    {t("General.buttons.delete")}
                                  </CButton>
                                }
                              </td>
                              )
                        },
                        'details':
                          (item, index)=>{
                            return (
                            <CCollapse show={this.state.delete.includes(index)}>
                              <CCardBody>
                                <h4>
                                  {t("Projects.titles.deleting_project") + item.name}
                                </h4>
                                <hr/>
                                <CRow>
                                  <CCol className="col-4 text-muted border-left">
                                    <b>{t("Projects.labels.reference") + ": "}</b>
                                    { item.reference}</CCol>
                                  <CCol className="col-4 text-muted border-left">
                                    <b>{t("Projects.labels.description") + ": "}</b>
                                    {item.description}</CCol>
                                  <CCol className="col-4 text-muted border-left">
                                    <b>{t("Projects.labels.created") + ": "}</b>
                                    {MomentTZ(item.created).tz(timezone).format('LL-LT')}</CCol>
                                </CRow>
                                <hr/>
                                <CButton size="sm" color="danger" className="ml-1" onClick={()=>{this.deleteProjectConfirmed(item,index)}}>
                                  {t("General.buttons.confirm")}
                                </CButton>
                                {this.state.delete.includes(index) &&
                                  <CButton
                                    color="info"
                                    variant="outline"
                                    shape="circle"
                                    size="sm"
                                    className=" ml-2"
                                    onClick={()=>{this.deleteProject(item,index)}}
                                  >
                                    {t("General.buttons.cancel")}
                                  </CButton>
                                }
                              </CCardBody>
                            </CCollapse>
                          )
                        }
                  }}
                />
              </CCardBody>
            </CCard>
            <Project
                show={this.state.showProject}
                project={this.state.project}
                closeProject={this.closeProject}
                fetchProjects={this.fetchProjects}
                notify={this.props.notify}
              />
      </div>
    )
  }
}

Projects.propTypes = propTypes;
Projects.defaultProps = defaultProps;

export default withTranslation()(Projects)
