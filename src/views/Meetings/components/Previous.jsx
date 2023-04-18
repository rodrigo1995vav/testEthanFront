import React, { Component } from 'react';

import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CCollapse,
  CDataTable,
  CDropdown,CDropdownMenu,CDropdownItem,CDropdownToggle,
  CLabel,
  CListGroup,CListGroupItem,CListGroupItemText,
  CRow,
  CSpinner,
  CTooltip
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import MomentTZ from 'moment-timezone';
import Moment from 'moment';
// React DateRangePicker
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import './../css/react_dates_overrides.css';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Previous extends Component {

  constructor(props){
    super(props);
    this.state = {
      details: []
    }

    this.detailMeeting.bind(this);
    this.isOutsideRange.bind(this);
  }

  detailMeeting = (item, index) => {
    var state = this.state;
    const position = state.details.indexOf(index);
    (position !== -1) ? state.details.splice(position, 1) : state.details.push(index);
    this.setState(state);
  }

  isOutsideRange = (day) => {
    if(this.state.focusedInput === "endDate"){
        return day.isAfter(Moment(new Date()).subtract(1,'day')) || day.isBefore(this.props.dates.startDate);
    }
    if(this.state.focusedInput === "startDate"){
        return day.isAfter(Moment(new Date()).subtract(1,'day')) || day.isAfter(this.props.dates.endDate) || day.isBefore(Moment(new Date()).add(-1, 'years'));
    }
    return false;
  }

  render() {
    const {previousMeetings, loading, dates, timezone, t} = this.props;
    const {details} = this.state;

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

  return (
                    <>
                      <CRow className="p-2">
                        <CCol className="col-12 text-left">
                          <DateRangePicker
                              startDate={dates.startDate}
                              startDateId="startDate"
                              endDate={dates.endDate}
                              required={true}
                              isOutsideRange={day => this.isOutsideRange(day)}
                              endDateId="endDate"
                              onDatesChange={({startDate, endDate}) => this.props.updateDates({startDate, endDate})}
                              focusedInput={this.state.focusedInput}
                              onFocusChange={focusedInput => this.setState({focusedInput})}
                              orientation='horizontal'
                              openDirection='down'
                              startDatePlaceholderText={t("Meetings.labels.startDate")}
                              endDatePlaceholderText={t("Meetings.labels.endDate")}
                              monthFormat="MMM"
                              weekDayFormat="dd"
                            />
                            {loading
                              ? <CSpinner animation="border" color="info" variant="outline" className="ml-5" />
                              : <CButton color="info" variant="outline" shape="circle" className="ml-3 mt-1" onClick={()=>{this.props.fetchMeetings(false,true, false)}}>
                                  {t("General.buttons.submit")}
                                </CButton>
                            }
                          </CCol>
                      </CRow>
                      <CDataTable
                          items={previousMeetings}
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
                                      <CBadge color={meetingsHelper.getMeetingClass(item.status === "completed" ? item.status : "missed")} className="ml-1" size="sm">{t("Meetings.labels.status_" + (item.status === "completed" ? item.status : "missed") )}</CBadge>
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
                                        <CDropdown className="m-1 btn-group">
                                        <CDropdownToggle color="primary" variant="outline" disabled={details.includes(index)?true:false}>
                                          {t("General.buttons.actions")}
                                        </CDropdownToggle>
                                        <CDropdownMenu placement="right-end">
                                          <CDropdownItem onClick={()=>{this.detailMeeting(item,index)}}>{t("General.buttons.view")}</CDropdownItem>
                                          {item.communications.length > 0 &&
                                            <CDropdownItem onClick={()=>{this.props.showCommunications(item)}}>{t("Meetings.buttons.communication_history")}</CDropdownItem>
                                          }
                                          {item.status === "new"
                                            ? <CDropdownItem
                                                onClick={()=>{this.props.editMeeting(item,index)}}
                                              >{t("Meetings.buttons.reschedule")}</CDropdownItem>
                                            : <CDropdownItem
                                                onClick={()=>{this.props.meetingObjectives(item,index)}}
                                              >{t("Meetings.buttons.objectives")}</CDropdownItem>
                                          }
                                          </CDropdownMenu>

                                      </CDropdown>
                                      </td>
                                      )
                                },
                                'details':
                                  (item, index)=>{
                                    return (
                                    <CCollapse show={details.includes(index)}>
                                      <CCardBody>
                                      <h4>
                                          {item.subject}
                                          <small className="ml-1 text-info text-decoration-none" >({item.code})</small>
                                          <CBadge color={meetingsHelper.getMeetingClass(item.status === "completed" ? item.status : "missed")} className="ml-1" size="sm">{t("Meetings.labels.status_" + (item.status === "completed" ? item.status : "missed") )}</CBadge>
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
                                      <CRow className="mt-1">
                                          <CCol className="col-3 text-muted text-left border-right">
                                            <h5><CIcon name="cil-speedometer" className="mr-2" />{t("Meetings.labels.agenda")}</h5>
                                            <CListGroup className="list-group">
                                              {item.agenda.map((item,index) => (
                                                <CListGroupItem  className="border-0 p-0" key={"agenda-"+index}>
                                                  <CListGroupItemText className="pl-2 border-0">
                                                    {(index+1) + ". " + item.content}
                                                    <CBadge color="info" className="ml-1">{meetingsHelper.convertDuration(item.duration)}</CBadge>
                                                    </CListGroupItemText>
                                                </CListGroupItem>
                                              ))}
                                            </CListGroup>
                                          </CCol>
                                          <CCol className="col-3 text-muted text-left border-right">
                                            <h5><CIcon name="cil-people" className="mr-2" />{t("Meetings.labels.attendees")}</h5>
                                            <CListGroup className="list-group">
                                              {item.attendees.map((item,index) => (
                                                <CListGroupItem  className="border-0 p-0" key={"attendee-"+index}>
                                                <CListGroupItemText  className="pl-2 border-0">
                                                  <CBadge color={meetingsHelper.getRequiredClass(item.presence)} className="mr-1">{t("Attendees.labels." + item.presence)}</CBadge>
                                                  {(index+1) + ". " + item.fullName}
                                                  {item.type === "coHost" &&
                                                    <CBadge color={meetingsHelper.getAttendeeClass(item.type)} className="ml-1">{t("Attendees.labels." + item.type)}</CBadge>
                                                  }
                                                </CListGroupItemText>
                                              </CListGroupItem>
                                              ))
                                              }
                                            </CListGroup>
                                          </CCol>
                                          <CCol className="col-3 text-muted text-left border-right">
                                            <h5><CIcon name="cil-task" className="mr-2" />{t("Meetings.labels.goals")}</h5>
                                            <CListGroup className="list-group">
                                              {item.goals.map((item,index) => (
                                                <CListGroupItem  className="border-0 p-0" key={"goal-"+index}>
                                                  <CListGroupItemText className="pl-2 border-0">
                                                    {(index+1) + ". " + item.item}
                                                    <CBadge color={meetingsHelper.getGoalClass(item.priority)} className="ml-1">{t("Goals.labels." + item.priority)}</CBadge>
                                                  </CListGroupItemText>
                                                </CListGroupItem>
                                              ))
                                              }
                                            </CListGroup>
                                          </CCol>
                                          <CCol className="col-3 text-muted text-left">
                                              <h5><CIcon name="cil-file" className="mr-2" />{t("Meetings.labels.documents")}</h5>
                                              <CListGroup className="list-group">
                                                {item.docs.map((item,index) => (
                                                  <CListGroupItem  className="border-0 p-0" key={"doc-"+index}>
                                                    <CListGroupItemText className="pl-2 border-0">
                                                      {(index+1) + ". "}
                                                      <a href={item.type === "link" ? item.url : process.env.REACT_APP_API_URL + (_.isUndefined(item.id) ? "tmp/" : "docs/") + item.url} target="_blank" rel='noreferrer noopener'>
                                                        {item.name}
                                                      </a>
                                                      <CBadge color={item.type === "link" ? "info" : "dark"} className="ml-1" size="sm">{t("Meetings.labels." + (item.type === "link" ? "link" : "file"))}</CBadge>
                                                    </CListGroupItemText>
                                                  </CListGroupItem>
                                                ))
                                                }
                                              </CListGroup>
                                          </CCol>
                                        </CRow>
                                      <hr/>
                                      {details.includes(index) &&
                                        <CButton
                                          color="primary"
                                          variant="outline"
                                          shape="circle"
                                          size="sm"
                                          className=" ml-2"
                                          onClick={()=>{this.detailMeeting(item,index)}}
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
                     </>
      );
  }
}


Previous.propTypes = propTypes;
Previous.defaultProps = defaultProps;


export default withTranslation()(Previous);
