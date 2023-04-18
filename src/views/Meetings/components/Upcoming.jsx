import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CCollapse,
  CDataTable,
  CDropdown, CDropdownMenu,CDropdownItem,CDropdownToggle,
  CLabel,
  CRow,
  CTooltip
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import MomentTZ from 'moment-timezone';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import toClipboard from 'copy-to-clipboard';

import _ from 'lodash';
import i18n from '../../../services/i18n';

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Upcoming extends Component {

  constructor(props){
    super(props);

    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.joinMeeting = this.joinMeeting.bind(this);
    this.state = {
      redirect: null
    }
  }

  copyToClipboard = (item) =>{
    toClipboard(process.env.REACT_APP_URL + process.env.REACT_APP_JOINING_URL + item.code.replace(/-/g,'') + "?lng="+ i18n.language);
    this.props.notify('success','Meetings.msgs.link_copied_successfully');
  }

  joinMeeting = (item) => {
    var state = this.state;
    state.redirect = process.env.REACT_APP_JOINING_URL + item.code.replace(/-/g,'') + "?lng="+ i18n.language;
    this.setState(state);
  }

  render() {
    const {upcomingMeetings, loading, timezone, t} = this.props;
    const {redirect} = this.state;

    const fields = [
      { key: 'datetime',
        label: t("Meetings.labels.dateTime"),
        _classes: 'font-weight-bold',
        filter: false
      },
      { key: 'duration',
        label: t("Meetings.labels.time"),
        _classes: 'font-weight-bold',
        sorter: false,
        filter: false
      },
      { key: 'code',
        label: t("Meetings.labels.code"),
        _classes: 'font-weight-bold',
        sorter: false
      },
      { key: 'subject',
        label: t("Meetings.labels.subject"),
        sorter: false
      },
      { key: 'meeting_details',
        label: t("Meetings.labels.details"),
        _classes: 'd-md-down-none',
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

  if(!_.isNull(redirect)){
    return <Redirect to={redirect} /> ;
  }

  return (
        <>
        <CDataTable
          items={upcomingMeetings}
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
              'datetime':
              (item)=>(
                <td>
                  <CLabel><CIcon name="cil-calendar" className="mr-1" size="sm"/> {MomentTZ(item.datetime).tz(timezone).format('LL')}</CLabel>
                  <small className="m-2 text-dark text-muted">
                        {"(GMT" + MomentTZ.tz(timezone).format('Z') + ")" }
                  </small>
                </td>
              ),
              'duration':
              (item)=>(
                <td>
                  <CLabel><CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(item.datetime).tz(timezone).format('LT')} - {MomentTZ(item.datetime).tz(timezone).add(item.duration,"minutes").format('LT')}</CLabel>
                  <small className="text-muted text-dark ml-2">({meetingsHelper.convertDuration(item.duration)})</small>
                </td>
              ),
              'code':
              (item)=>(
                <td className="text-info text-decoration-none">
                    {item.code}
                    {item.secure &&
                    <CTooltip content={item.password}>
                      <CIcon name="cil-lock-locked" className="ml-1 text-dark" />
                    </CTooltip>
                    }
                </td>
              ),
              'subject':
              (item)=>(
                <td>
                    {item.subject}
                    {item.status === "started" &&
                      <CBadge color={meetingsHelper.getMeetingClass(item.status)} className="ml-1" size="sm">{t("Meetings.labels.status_"+item.status)}</CBadge>
                    }
                </td>
              ),
              'meeting_details':
              (item)=>(
                <td className="d-md-down-none">
                  <CBadge color="gray" className="ml-2"><CIcon name="cil-speedometer" size="sm"/>{item.agenda.length}</CBadge>
                  <CBadge color="gray" className="ml-2"><CIcon name="cil-people" size="sm"/>{item.attendees.length}</CBadge>
                  <CBadge color="gray" className="ml-2"><CIcon name="cil-task" size="sm"/>{item.goals.length}</CBadge>
                  <CBadge color="gray" className="ml-2"><CIcon name="cil-file" size="sm"/>{item.docs.length}</CBadge>
                </td>
              ),
              'menu':
                (item, index)=>{
                    return (
                      <td className="py-2 text-center">
                        {item.status === "new" && item.timeLeft <= process.env.REACT_APP_MEETING_MAX_START_DELAY &&
                          <CButton onClick={()=>{this.props.startMeeting(item)}} color="success">{t("Meetings.buttons.start")}</CButton>
                        }
                        {item.status === "started" &&
                          <CButton onClick={()=>{this.joinMeeting(item)}} color="success">{t("Meetings.buttons.join")}</CButton>
                        }
                        <CDropdown className="m-1 btn-group">
                          <CDropdownToggle color="primary" variant="outline" disabled={this.props.cancel.includes(index)?true:false}>
                            {t("General.buttons.actions")}
                          </CDropdownToggle>
                          <CDropdownMenu placement="right-end">
                            <CDropdownItem onClick={()=>{this.copyToClipboard(item)}}>{t("Meetings.buttons.copy_to_clipboard")}</CDropdownItem>
                            <CDropdownItem onClick={()=>{this.props.sendInvitations(item,'request')}}>{t("Meetings.buttons.send_invitations")}</CDropdownItem>
                            {item.communications.length > 0 &&
                              <CDropdownItem onClick={()=>{this.props.showCommunications(item)}}>{t("Meetings.buttons.communication_history")}</CDropdownItem>
                            }
                            {item.status === "new" &&
                            <>
                              <CDropdownItem onClick={()=>{this.props.editMeeting(item)}}>{t("General.buttons.edit")}</CDropdownItem>
                              <CDropdownItem className="text-danger"
                                onClick={()=>{this.props.cancelMeeting(item,index)}}
                              >{t("General.buttons.cancel")}</CDropdownItem>
                            </>
                            }
                          </CDropdownMenu>
                        </CDropdown>
                      </td>
                      )
                },
                'details':
                  (item, index)=>{
                    return (
                    <CCollapse show={this.props.cancel.includes(index)}>
                      <CCardBody>
                      <h4>
                          {t("Meetings.titles.cancelling_meeting") + item.subject}
                          <small className="ml-1 text-info text-decoration-none" >({item.code})</small>
                          {item.status === "started" &&
                            <CBadge color={meetingsHelper.getMeetingClass(item.status)} className="ml-1" size="sm">{t("Meetings.labels.status_"+item.status)}</CBadge>
                          }
                      </h4>
                      <hr/>
                      <CRow>
                        <CCol className="col-3 text-muted">
                          <CLabel><CIcon name="cil-calendar" className="mr-1" size="sm"/> {MomentTZ(item.datetime).tz(timezone).format('LL')}</CLabel>
                          <small className="m-2 text-dark text-muted">
                              {"(GMT" + MomentTZ.tz(timezone).format('Z') + ")" }
                          </small>
                        </CCol>
                        <CCol className="col-3 text-muted">
                          <CLabel><CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(item.datetime).tz(timezone).format('LT')} - {MomentTZ(item.datetime).tz(timezone).add(item.duration,"minutes").format('LT')}</CLabel>
                        </CCol>
                        <CCol className="col-3 text-muted">
                          <CLabel>{t("Meetings.labels.duration") + meetingsHelper.convertDuration(item.duration)}</CLabel>
                        </CCol>
                        <CCol className="col-3 text-muted">
                          {item.reference.length > 0 &&
                            <CLabel>{t("Meetings.labels.reference")+ item.reference}</CLabel>
                          }
                        </CCol>
                      </CRow>
                      <hr/>
                      <CButton size="sm" color="danger" className="ml-1" onClick={()=>{this.props.cancelMeetingConfirmed(item,index)}}>
                        {t("General.buttons.confirm")}
                      </CButton>
                      {this.props.cancel.includes(index) &&
                        <>
                          <CButton
                              color="info"
                              variant="outline"
                              shape="circle"
                              size="sm"
                              className=" ml-2"
                              onClick={()=>{this.props.cancelMeeting(item,index)}}
                            >
                              { t("General.buttons.cancel")}
                            </CButton>
                            <small className="ml-3 text-danger">{t("Meetings.labels.cancelling_meeting_note")}</small>
                          </>
                      }
                      </CCardBody>
                    </CCollapse>
                  )
                }
          }}
        />
        </>
      );
  }
}


Upcoming.propTypes = propTypes;
Upcoming.defaultProps = defaultProps;


export default withTranslation()(Upcoming);
