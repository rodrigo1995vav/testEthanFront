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
  CTabs,CTabContent,CTabPane, CBadge,CTextarea
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';
import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";
import nl2br from "react-nl2br";

import MomentTZ from "moment-timezone";

import _ from 'lodash';

//React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
//DatePicker
import DatePicker from 'react-date-picker';

import i18n from './../../../services/i18n';

import Docs from './TasksDocs';

var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Task extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.componentsInitialized = this.componentsInitialized.bind(this);
    this.setDocs = this.setDocs.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.deleteTask = this.deleteTask.bind(this);

    this.state = {
      loading: true,
      values: {
        title: "",
        description: "",
        priority: 'p1',
        status: '',
        board: '',
        type: '',
        progress: 0,
        dueDate: '',
        msg: '',
        comments: [],
        docs: []
      },
      initializeComponents: false,
      members: [],
      user: {
        fullName: auth.getValue('fullName'),
        id: auth.getValue('id')
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
          title: "",
          description: "",
          priority: 'p1',
          status: '',
          board: '',
          type: '',
          progress: 0,
          dueDate: '',
          msg: '',
          comments: [],
          docs: []
        };
        state.members = [];
        this.setState(state);
      }
      else {
        state.errors = {};

        for(var i=0; i < this.props.project.members.length ; i++){
          state.members.push({
            value: this.props.project.members[i].user,
            label: this.props.project.members[i].fullName
          });
        }

        if(!_.isNull(this.props.column)){
          state.values.board = this.props.column.title;
        }

        if(!_.isNull(this.props.task))
        {
          var task = this.props.task;
          _.forEach(task, function(value, key) {
                if (_.indexOf(['assignedTo','title', 'description', 'priority', 'status', 'board', 'type', 'progress', 'dueDate'], key) >= 0)
                    state.values[key] = value;
          });

          state.values.comments = _.clone(task.comments);
          state.values.docs = _.clone(task.docs);

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
    if(name === 'assignedTo'){
      state.values[name] = _.isNull(value) ? null : value.value;
    }
    else
    {
      state.values[name] = value;
    }
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

  setDocs = (items) => {
    var state = this.state;
    state.values.docs = _.orderBy(items, ['name'], ['asc']);
    this.setState(state);
  }

  addComment = () => {
    var state = this.state;
    state.values.comments.push({
      msg: state.values.msg,
      date: new Date(),
      user: state.user.id,
      fullName: state.user.fullName
    });
    state.values.msg = '';
    this.setState(state);
  }

  async onSubmit (event) {
    event.preventDefault();
    var state = this.state;

    state.loading = true;
    this.setState(state);

    var msg = _.isNull(this.props.task) ? "Task.msgs.task_created_successfully" : "Task.msgs.task_updated_successfully";
    var res = await fetch(
                    auth.prepareURL((_.isNull(this.props.task) ?
                      process.env.REACT_APP_API_URL_TASKS_INSERT + this.props.project.id:
                      process.env.REACT_APP_API_URL_TASKS_UPDATE + this.props.project.id + "/" + this.props.task._id )),
                      auth.getRequestInit(_.isNull(this.props.task) ? 'post' : 'put', state.values));

    var status = res.status;
    var data = await res.json();
    if(status === 200)
    {
      this.props.closeTask();
      this.props.notify('success', msg);
      this.props.fetchTasks();
    }
    else
    {
      state.loading = false;
      state.errors = data.errors;
      this.setState(state);
    }
  }

  async deleteTask (event) {
    event.preventDefault();
    var state = this.state;

    state.loading = true;
    this.setState(state);

    var res = await fetch(
                      auth.prepareURL(process.env.REACT_APP_API_URL_TASKS_DELETE + this.props.project.id + "/" + this.props.task._id),
                      auth.getRequestInit('delete', null));

    var status = res.status;
    if(status === 200)
    {
      this.props.closeTask();
      this.props.notify('success', "Task.msgs.task_deleted_successfully");
      this.props.fetchTasks();
    }
    else
    {
      var data = await res.json();
      state.loading = false;
      state.errors = data.errors;
      this.setState(state);
    }
  }

  render() {
    const {t, show, task, project, timezone, editable} = this.props;
    const {loading, values, members, user} = this.state;

      return (
        <CModal
              show={show}
              onClose={this.props.closeTask}
              centered={true}
              fade={true}
              size="xl"
            >
              <CModalHeader closeButton>
                {_.isNull(task) ? t("Task.titles.new_task"): t("Task.titles.edit_task")}
                </CModalHeader>
              <CModalBody>
              {loading
                ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                :
                 <CForm onSubmit={this.onSubmit}>
                   <CRow>
                      <CCol xs="12" sm="5">
                        <CCard className="overflow-auto"   style={{height: '360px'}}>
                          <CCardHeader>{t("Task.titles.general_information")}</CCardHeader>
                          <CCardBody>
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-bookmark" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                      type="text"
                                      name="title"
                                      placeholder={t("Task.labels.title")}
                                      className={values.title.match(/[0-9A-Za-z]{2}/) ? "is-valid col-10 ml-1" : "is-invalid col-10 ml-1"}
                                      value={values.title}
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
                                      placeholder={t("Task.labels.description")}
                                      value={values.description}
                                      autoComplete="off"
                                      onChange={this.handleInputChange}
                                      className="col-10 ml-1"
                                      />
                              </CInputGroup>
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-layers" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>

                                    <CSelect
                                      name="status"
                                      custom
                                      className="text-left col-5 ml-1"
                                      value={values.status}
                                      onChange={this.handleInputChange}
                                    >
                                      <option value="">{t("Task.labels.status")}</option>
                                      <option value="new">{t("Task.labels.new")}</option>
                                      <option value="assigned">{t("Task.labels.assigned")}</option>
                                      <option value="cancelled">{t("Task.labels.cancelled")}</option>
                                      <option value="resolved">{t("Task.labels.resolved")}</option>
                                      <option value="closed">{t("Task.labels.closed")}</option>
                                    </CSelect>

                                    <CSelect
                                      name="priority"
                                      custom
                                      className="text-left col-5 ml-1"
                                      value={values.priority}
                                      onChange={this.handleInputChange}
                                    >
                                      <option value="p1">{t("Task.labels.p1")}</option>
                                      <option value="p3">{t("Task.labels.p3")}</option>
                                      <option value="p5">{t("Task.labels.p5")}</option>
                                    </CSelect>
                              </CInputGroup>
                              <CInputGroup className="mb-2">
                                    <CInputGroupPrepend>
                                      <CInputGroupText>
                                        <CIcon name="cil-user" />
                                      </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <Select
                                      value={values.assignedTo}
                                      options={members}
                                      placeholder={t("Task.labels.assignedTo")}
                                      onChange={(value) => this.onChange("assignedTo", value)}
                                      className="col-8 ml-1 pl-0"
                                    />
                              </CInputGroup>
                              <CInputGroup className="mb-2">
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
                                      className="text-left col-5 ml-1"
                                      >
                                        <option value="">{t("Task.labels.type")}</option>
                                        <option value="bug">{t("Task.labels.bug")}</option>
                                        <option value="feature">{t("Task.labels.feature")}</option>
                                        <option value="change">{t("Task.labels.change")}</option>
                                        <option value="task">{t("Task.labels.task")}</option>
                                        <option value="request">{t("Task.labels.request")}</option>
                                    </CSelect>

                                    <CSelect
                                      name="board"
                                      custom
                                      value={values.board}
                                      onChange={this.handleInputChange}
                                      className="text-left col-5 ml-1"
                                      >
                                        <option value="">{t("Task.labels.board")}</option>
                                        {project.board.map((item, k) => (
                                            <option value={item.item} key={'member-'+k}>{item.item}</option>
                                        ))}
                                    </CSelect>
                              </CInputGroup>

                              <CInputGroup className="mb-2">
                                      <CInputGroupPrepend>
                                        <CInputGroupText>
                                          <CIcon name="cil-calendar" />
                                        </CInputGroupText>
                                      </CInputGroupPrepend>
                                      <DatePicker
                                        name="date"
                                        locale={i18n.language}
                                        placeholder={t("Task.labels.dueDate")}
                                        onChange={(value => this.onChange("dueDate", value))}
                                        value={values.dueDate}
                                        format="dd/MM/y"
                                        className="col-5 ml-1 pl-0"
                                      />
                              </CInputGroup>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol xs="12" sm="7">
                        <CCard>
                          <CCardBody>
                            <CTabs fade={false}>
                              <CNav variant="tabs" className='nav-underline nav-underline-primary nav-justified'>
                                <CNavItem>
                                  <CNavLink>
                                    {t("Task.titles.attachments")}
                                    <CBadge color="primary" className="ml-1">{values.docs.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                  <CNavLink>
                                    {t("Task.titles.comments")}
                                    <CBadge color="primary" className="ml-1">{values.comments.length}</CBadge>
                                  </CNavLink>
                                </CNavItem>
                              </CNav>
                              <CTabContent>
                                <CTabPane className="p-2 overflow-auto"  style={{height: '300px'}}>
                                  <Docs
                                    docs={values.docs}
                                    setDocs={this.setDocs}
                                    editable={editable}
                                  />
                                </CTabPane>
                                <CTabPane className="p-2 overflow-auto"  style={{height: '300px'}}>
                                  <div className="overflow-auto p-1 text-left" style={{height: '180px'}}>
                                    {values.comments.map((comment, index) => (
                                        <div key={"comment-"+index}>
                                          <div className="message mr-1">
                                            <div>
                                              {comment.user !== user.id
                                              ?
                                              <>
                                                <small className="text-muted">{MomentTZ(comment.datetime).tz(timezone).format('LL-LT')}</small>
                                                <small className="text-muted float-right mt-1">{comment.fullName}</small>
                                              </>
                                              :
                                              <>
                                                <small className="text-muted">{comment.fullName}</small>
                                                <small className="text-muted float-right mt-1">{MomentTZ(comment.datetime).tz(timezone).format('LL-LT')}</small>
                                              </>
                                              }
                                            </div>
                                            <small className="text-muted">{nl2br(comment.msg)}</small>
                                          </div>
                                          {values.comments.length-1 !== index &&
                                            <hr/>
                                          }
                                        </div>
                                      ))}
                                  </div>
                                  {editable &&
                                    <div className="overflow-auto text-left text-primary" style={{height: '100px'}}>
                                      <hr/>
                                      <CInputGroup>
                                          <CTextarea
                                            type="text"
                                            name="msg"
                                            placeholder={t("Execution.labels.msg")}
                                            value={values.msg}
                                            autoComplete="off"
                                            className="col-11 border-silver"
                                            size="sm"
                                            onChange={this.handleInputChange}
                                          />
                                          <CButton color="dark" variant="outline" onClick={this.addComment} disabled={values.msg.match(/[A-Z0-9a-z]/) ? false : true} className="col-2 ml-1">
                                            <CIcon name="cil-share" size="xl" />
                                          </CButton>
                                      </CInputGroup>
                                    </div>
                                  }
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
              {loading === false && editable &&
                <CModalFooter>
                  {!_.isNull(this.props.task) && !_.isUndefined(this.props.task.id) &&
                    <CButton color="danger" className=" mr-5" onClick={this.deleteTask}>{t("General.buttons.delete")}</CButton>
                  }

                  <CButton color="primary" disabled={values.title.match(/[0-9A-Za-z]{2}/) ? false: true} type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeTask}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
              }
            </CModal>
      );
  }
}

Task.propTypes = propTypes;
Task.defaultProps = defaultProps;

export default withTranslation()(Task);
