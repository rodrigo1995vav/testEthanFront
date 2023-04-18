import React, { Component } from 'react';
import {
  CBadge,
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
import i18n from 'i18next';
import MomentTZ from 'moment-timezone';
import Moment from 'moment';
import PropTypes from "prop-types";

import _ from 'lodash';

import {FiUsers} from 'react-icons/fi';

import User from './components/User';


var auth = require('./../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Users extends Component {
  constructor(props) {
    super(props);

    this.fetchUsers.bind(this);
    this.getBadge.bind(this);
    this.addUser.bind(this);
    this.closeUser.bind(this);
    this.editUser.bind(this);
    this.deleteUser.bind(this);
    this.deleteUserConfirmed.bind(this);

    this.state = {
      delete: [],
      showUser: false,
      user: null,
      users: [],
      language: i18n.language,
      connectedUser: auth.getValue("email"),
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
    this.fetchUsers();
  }

  fetchUsers = () => {
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_LIST), auth.getRequestInit('post', null))
    .then(async res => {
      this.state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(this.state.status === 200)
      {
        state.users = data.users;
        state.users.map(function(user,k){
          if(user.lastLoginDate === undefined)
          {
            state.users[k].lastLoginDate = "";
          }
          if(user.deleted)
          {
            state.users[k].status = "deleted";
          }
          else
          {
            if(!user.active)
            {
              state.users[k].status = "inactive";
            }
            else
            {
              state.users[k].status = "active";
              if(user.loginAttempts > 5 )
              {
                state.users[k].status = "locked";
              }
            }
          }
          return true;
        });
      }
      state.loading = false
      this.setState({state});
    })
    .catch(err => {
    });
  }

  getBadge = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'locked': return 'warning';
      case 'deleted': return 'danger';
      default: return 'primary';
    }
  }

  addUser = (event) => {
    this.setState({
      showUser: true
    });
  }

  closeUser = (event) => {
    this.setState({
      showUser: false,
      user: null
    })
  }

  editUser = (item) => {
    this.setState({
      showUser: true,
      user: item
    });
  }

  deleteUser = (item, index) => {
    var state = this.state;
    const position = state.delete.indexOf(index);
    (position !== -1) ? state.delete.splice(position, 1) : state.delete.push(index);
    this.setState(state);
  }

  deleteUserConfirmed = (item, index) => {
    var state = this.state;

    const position = state.delete.indexOf(index);
    (position !== -1) ? state.delete.splice(position, 1) : state.delete.push(index);

    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_DELETE + item._id), auth.getRequestInit('delete', null))
    .then(async res => {
      state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(state.status === 200)
      {
        this.props.notify('success', 'Users.msgs.user_deleted_successfully');
        this.setState(state);
        this.fetchUsers();
      }
    })
    .catch(err => {});
  }

  render() {
    const {t, timezone} = this.props;
    const {users, connectedUser, loading} = this.state;
    const fields = [
        { key: 'fullName',
          label: t("Users.labels.fullName"),
          _classes: 'font-weight-bold'
        },
        { key: 'email',
          label: t("Users.labels.email")
        },
        { key: 'role',
          label: t("Users.labels.role")
        },
        { key: 'created',
          label: t("Users.labels.created"),
          _classes: 'd-md-down-none'
        },
        { key: 'lastLoginDate',
          label: t("Users.labels.lastLoginDate"),
          _classes: 'd-md-down-none'
        },
        { key: 'status',
          label: t("Users.labels.status"),
          _style: {width: '5%'}
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
              <FiUsers className="mr-3"/>
              <CLabel className="font-lg">{t("Users.titles.users")}</CLabel>
              <div className="card-header-actions">
              <CButton block color="primary" shape="circle" size="sm" variant="outline" onClick={() => this.addUser()}>{t("Users.labels.new_user")}</CButton>
              </div>
              </CCardHeader>
              <CCardBody className=" p-0">
                <CDataTable
                  items={users}
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
                      'status':
                      (item)=>(
                        <td>
                          <CBadge color={this.getBadge(item.status)}>
                            {t("Users.labels.status_" + item.status)}
                          </CBadge>
                        </td>
                      ),
                      'role':
                      (item)=>(
                        <td>
                            {t("Users.labels." + item.role)}
                        </td>
                      ),
                      'created':
                      (item)=>(
                        <td className="d-md-down-none">
                            {MomentTZ(item.created).tz(timezone).format('LL-LT')}
                        </td>
                      ),
                      'lastLoginDate':
                        (item)=>(
                          <td className="d-md-down-none">
                              {(item.lastLoginDate !== "" ) ? MomentTZ(item.lastLoginDate).tz(timezone).format('LL-LT') : ""}
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
                                  onClick={()=>{this.editUser(item)}}
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
                                    onClick={()=>{this.deleteUser(item,index)}}
                                    disabled={ (connectedUser === item.email) ? true : false}
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
                                  {t("Users.titles.deleting_user") + item.fullName}
                                </h4>
                                <hr/>
                                <CRow>
                                  <CCol className="col-4 text-muted border-left"><b>{t("Users.labels.role") + ": "}</b>{t("Users.labels." + item.role)}</CCol>
                                  <CCol className="col-4 text-muted border-left"><b>{t("Users.labels.created") + ": "}</b>{MomentTZ(item.created).tz(timezone).format('LL-LT')}</CCol>
                                  <CCol className="col-4 text-muted border-left"><b>{t("Users.labels.lastLoginDate") + ": "}</b>{((item.lastLoginDate !== "" ) ? MomentTZ(item.lastLoginDate).tz(timezone).format('LL-LT') : "") }</CCol>
                                </CRow>
                                <hr/>
                                <CButton size="sm" color="danger" className="ml-1" onClick={()=>{this.deleteUserConfirmed(item,index)}}>
                                  {t("General.buttons.confirm")}
                                </CButton>
                                {this.state.delete.includes(index) &&
                                  <CButton
                                    color="info"
                                    variant="outline"
                                    shape="circle"
                                    size="sm"
                                    className=" ml-2"
                                    onClick={()=>{this.deleteUser(item,index)}}
                                    disabled={ (connectedUser === item.email) ? true : false}
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
            <User
                show={this.state.showUser}
                user={this.state.user}
                closeUser={this.closeUser}
                fetchUsers={this.fetchUsers}
                notify={this.props.notify}
              />
      </div>
    )
  }
}

Users.propTypes = propTypes;
Users.defaultProps = defaultProps;

export default withTranslation()(Users)
