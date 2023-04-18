import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CRow,
  CBadge,
  CDataTable,
  CTabPane, CTabContent, CTabs, CNav, CNavItem, CNavLink
} from '@coreui/react';

import _ from 'lodash';
import nl2br from 'react-nl2br';

import { withTranslation } from 'react-i18next';

import MomentTZ from 'moment-timezone';

import {FaPlus, FaEye, FaComments, FaEdit} from 'react-icons/fa';
import {GrAttachment } from 'react-icons/gr';

//React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
//Board
import Board from '@lourenci/react-kanban'
import '@lourenci/react-kanban/dist/styles.css'

import Task from './TasksModal';

var auth = require("./../../../services/Auth");

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Tasks extends Component {
  constructor(props){
    super(props);

    this.onChangeProject = this.onChangeProject.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.getTaskClass = this.getTaskClass.bind(this);
    this.addTask = this.addTask.bind(this);
    this.editTask = this.editTask.bind(this);
    this.closeTask = this.closeTask.bind(this);
    this.cardDragged = this.cardDragged.bind(this);
    this.syncProject = this.syncProject.bind(this);
    this.confirmation = this.confirmation.bind(this);

    this.state = {
      loading: true,
      projects: [],
      selectableProjects: [],
      showTask: false,
      task: null,
      column: null
    }
  }

  componentDidMount() {
    this.fetchProjects()
  }

  onChangeProject = (value)=>{
    var state = this.state;
    var project = this.props.project;
    project.id = _.isNull(value) ? null : value.value;
    project.details = _.isNull(value) ? null : value.project;

    if(!_.isNull(project.id)){
      state.loading = true;
      project.board = null;
      project.board = {
        columns: []
      };

      project.members = {};
      project.details.members.map((v, k) => {
        project.members[v.user] = v;
        return true;
      });
      this.fetchTasks();
    }
    else{
      this.syncProject(project);
    }

    this.setState(state);
  }

  fetchProjects = () => {
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_PROJECTS_MEMBER), auth.getRequestInit('post', null))
    .then(async res => {
      this.state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(this.state.status === 200)
      {
        state.projects = data.projects;
        state.projects.map((project,i) => {
          state.selectableProjects.push({
            value: project.id,
            label: project.name,
            project: project
          });
          return true;
        });
        state.loading = false;
        this.setState(state);
      }
    })
    .catch(err => {
    });
  }

  fetchTasks = () => {
    var state = this.state;
    var project = this.props.project;
    project.board = {
      columns: []
    };

    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_TASKS_LIST + project.id), auth.getRequestInit('post', null))
    .then(async res => {
      this.state.status = res.status;
      return await res.json();
    })
    .then(data => {

      if(this.state.status === 200)
      {
        project.tasks = data.tasks;

        project.details.board.map((item, key) => {
          if(item.status === 'show'){

            project.board.columns.push({
              id: (key+1),
              title: item.item,
              cards: []
            })

            project.tasks.map((task, i) => {
              if(task.board === item.item) {
                project.board.columns[project.board.columns.length-1].cards.push({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  task: task
                });
              }
              return true;
            })

            project.board.columns[project.board.columns.length-1].cards = _.orderBy(project.board.columns[project.board.columns.length-1].cards, ['priority','type'],['desc','asc']);
          }
          return true;
        });
      }
      state.loading = false;
      this.syncProject(project);
      this.setState(state);
    })
    .catch(err => {
    });
  }

  addTask = (column) => {
    var state = this.state;
    state.showTask = true;
    state.task = null;
    state.column = column;
    this.setState(state);
  }

  editTask = (task) => {
    var state = this.state;
    state.showTask = true;
    state.task = task;
    state.column = null;
    this.setState(state);
  }

  closeTask = () => {
    var state = this.state;
    state.showTask = false;
    state.task = null;
    state.column = null;
    this.setState(state);
  }

  cardDragged = async (card, source, destination) => {
    var state = this.state;
    var project = this.props.project;
    project.board.columns.map((c, i) => {
      if(c.id === source.fromColumnId)
      {
        project.board.columns[i].cards.splice(source.fromPosition, 1);
      }
      if(c.id === destination.toColumnId){
        card.task.board = c.title;
        project.board.columns[i].cards.push(card);
      }
      project.board.columns[i].cards = _.orderBy(project.board.columns[i].cards, ['priority','type'],['desc','asc']);
      return true;
    });

    this.props.syncMeeting({project: project});

    var res = await fetch( auth.prepareURL(process.env.REACT_APP_API_URL_TASKS_UPDATE + project.id + "/" + card.task._id) ,
                           auth.getRequestInit('put', {board: card.task.board, docs: []} ) );

    if(res.status !== 200)
    {
        this.props.notify('danger', 'Execution.msgs.sync_not_sent');
    }
    this.syncProject(project);
    this.setState(state);
  }

  getTaskClass = (priority) => {
    switch (priority) {
      case "p5":
          return "danger";
      case "p3":
          return "warning";
      default:
          return "success";
    }
  }

  syncProject = (project) => {
    this.props.syncMeeting({project: project});
    if(this.props.user.email === this.props.settings.project)
    {
      this.props.socket.emit('project', project, (res) => this.confirmation(res));
    }
  }

  confirmation = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.sync_not_sent");
    }
  }

  render() {
    const {user, settings, project, t} = this.props;
    const {loading, selectableProjects} = this.state;

    const fields = [
      { key: 'number',
        label: t("Tasks.labels.number"),
        _classes: 'font-weight-bold',
        _style: {width: '5%'}
      },
      { key: 'title',
        label: t("Tasks.labels.title"),
        _classes: 'font-weight-bold'
      },
      { key: 'status',
        label: '',
        sorter: false,
        filter: false
      },
      { key: 'created',
        label: t("Tasks.labels.created"),
        _classes: 'd-md-down-none'
      },
      { key: 'dueDate',
        label: t("Tasks.labels.dueDate"),
        _classes: 'd-md-down-none'
      },
      {
        key: 'menu',
        label: '',
        sorter: false,
        filter: false
      }
  ];

    return (
            <CTabPane>
              <CRow className="pt-1 mb-1">
                <CCol className="col-12 text-center">
                  {user.email === settings.project
                   ?
                      <Select
                        name="project"
                        value={project.id}
                        options={selectableProjects}
                        placeholder={t("Tasks.labels.select_project")}
                        onChange={(value) => this.onChangeProject(value)}
                        className="col-4 text-left"
                      />
                    : <h4>
                      {!_.isNull(project.id) ? project.details.name : "" }
                      </h4>
                    }
                </CCol>
              </CRow>
              <div style={{ height: window.innerHeight*0.73 }} className="border-primary mt-1 p-1">
                    {loading
                    ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                    :
                      <>
                          {!_.isNull(project.id) &&
                            <>
                              <CTabs>
                                  <CNav variant='tabs' className='nav-underline nav-underline-primary nav-stacked'>
                                    <CNavItem>
                                      <CNavLink>
                                        {t("Tasks.titles.board")}
                                      </CNavLink>
                                    </CNavItem>
                                    <CNavItem>
                                      <CNavLink>
                                        {t("Tasks.titles.list")}
                                      </CNavLink>
                                    </CNavItem>
                                  </CNav>

                                  <CTabContent>

                                    <CTabPane className="p-2">
                                      <Board
                                        children={project.board}
                                        allowAddColumn={false}
                                        allowRemoveColumn={false}
                                        disableColumnDrag={true}
                                        allowRenameColumn={false}

                                        disableCardDrag={user.email === settings.project ? false : true}
                                        onCardDragEnd={this.cardDragged}

                                        renderCard={(card) => (
                                          <div className="react-kanban-card bg-silver">
                                            <div className={"react-kanban-card__title p-1 alert-" + this.getTaskClass(card.task.priority)}>
                                              {'#' + card.task.number + ' - ' + card.title}
                                            </div>
                                            <div className="react-kanban-card__description">{nl2br(card.description)}</div>
                                            <div className="react-kanban-card__description small ">
                                              <CBadge color={this.getTaskClass(card.task.priority)} className="mr-1">{t("Task.labels." + card.task.priority)}</CBadge>
                                              {card.task.type !== "" &&
                                                <CBadge color="light" className="mr-1">{ t("Task.labels." + card.task.type)}</CBadge>
                                              }
                                              {card.task.status !== "" &&
                                                <CBadge color="info" className="mr-1">{t("Task.labels." + card.task.status)}</CBadge>
                                              }
                                                <CButton className='float-right' variant="ghost" color="primary" size="sm" type='button' onClick={() => this.editTask(card.task)}>
                                                    {user.email === settings.project
                                                    ? <FaEdit />
                                                    : <FaEye />
                                                    }
                                                </CButton>
                                            </div>
                                            <div className="react-kanban-card__description small">
                                              {!_.isUndefined(card.task.assignedTo) &&  card.task.assignedTo !== "" && !_.isNull(card.task.assignedTo) &&
                                                <CBadge color="dark" className="mr-1">{project.members[card.task.assignedTo].fullName}</CBadge>
                                              }
                                              <CBadge color="silver" className="mr-1"><GrAttachment className="mr-1" />{card.task.docs.length}</CBadge>
                                              <CBadge color="silver" className="mr-1"><FaComments className="mr-1" />{card.task.comments.length}</CBadge>
                                              {card.task.dueDate !== "" && !_.isNull(card.task.dueDate) &&
                                                <CBadge color="primary" className="mr-1">{MomentTZ(card.task.dueDate).tz(user.timezone).format('LL')}</CBadge>
                                              }
                                            </div>
                                          </div>
                                        )}

                                        renderColumnHeader={(column) => (
                                          <div className="react-kanban-column__title font-weight-bold text-uppercase mb-3">
                                            {column.title}
                                            {user.email === settings.project &&
                                              <CButton className='float-right' color="primary" variant="outline" size="sm" type='button' onClick={() => this.addTask(column)}>
                                                  <FaPlus />
                                              </CButton>
                                            }
                                          </div>
                                        )}
                                        />
                                    </CTabPane>

                                    <CTabPane className="p-2">
                                      <CDataTable
                                        items={project.tasks}
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
                                            'title':
                                            (item) => (
                                              <td>
                                                {item.title} <CBadge color={this.getTaskClass(item.priority)} className="mr-1">{t("Task.labels." + item.priority)}</CBadge>
                                              </td>
                                            ),
                                            'status':
                                            (item)=>(
                                              <td>
                                                  {item.type !== "" &&
                                                    <CBadge color="light" className="mr-1">{ t("Task.labels." + item.type)}</CBadge>
                                                  }
                                                  {item.status !== "" &&
                                                    <CBadge color="info" className="mr-1">{t("Task.labels." + item.status)}</CBadge>
                                                  }
                                                  {!_.isUndefined(item.assignedTo) &&  item.assignedTo !== "" && !_.isNull(item.assignedTo) &&
                                                    <CBadge color="dark" className="mr-1">{project.members[item.assignedTo].fullName}</CBadge>
                                                  }
                                                  <CBadge color="silver" className="mr-1"><GrAttachment className="mr-1" />{item.docs.length}</CBadge>
                                                  <CBadge color="silver" className="mr-1"><FaComments className="mr-1" />{item.comments.length}</CBadge>
                                              </td>
                                            ),
                                            'created':
                                            (item)=>(
                                              <td className="d-md-down-none">
                                                  {MomentTZ(item.created).tz(user.timezone).format('LL')}
                                              </td>
                                            ),
                                            'dueDate':
                                              (item)=>(
                                                <td className="d-md-down-none">
                                                    {(item.dueDate !== "" && !_.isNull(item.dueDate) ) ? MomentTZ(item.dueDate).tz(user.timezone).format('LL') : ""}
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
                                                        onClick={()=>{this.editTask(item)}}
                                                      >
                                                        {user.email === settings.project ? t("General.buttons.edit") : t("General.buttons.view")}
                                                      </CButton>
                                                    </td>
                                                    )
                                              }
                                        }}
                                      />
                                    </CTabPane>
                                  </CTabContent>
                                </CTabs>
                                <Task
                                  show={this.state.showTask}
                                  task={this.state.task}
                                  column={this.state.column}
                                  project={project.details}
                                  closeTask={this.closeTask}
                                  fetchTasks={this.fetchTasks}
                                  timezone={user.timezone}
                                  notify={this.props.notify}
                                  editable={user.email === settings.project}
                                />
                            </>
                          }
                      </>
                    }
              </div>

            </CTabPane>
    );
  }
}

Tasks.propTypes = propTypes;
Tasks.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Tasks));
