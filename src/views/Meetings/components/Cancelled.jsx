import React, { Component } from 'react';

import {
  CBadge,
  CDataTable,
  CLabel,
  CDropdown, CDropdownDivider,CDropdownMenu,CDropdownItem,CDropdownToggle,
  CTooltip
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

class Cancelled extends Component {

  constructor(props){
    super(props);
    this.restore.bind(this);

    this.state = {
      showInvitations: false,
      meeting: null
    }
  }

  restore = async function (item) {
    this.props.notify("info","Meetings.msgs.meeting_restore_in_progress");
    var res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_RESTORE) + item._id, auth.getRequestInit('get', null));
    if(res.status === 200)
    {
        this.props.notify("success","Meetings.msgs.meeting_restored_successfully");
        this.props.fetchMeetings(true,false,true);
    }
  }

  render() {
    const {cancelledMeetings, loading, timezone, t} = this.props;

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
        <CDataTable
          items={cancelledMeetings}
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
                          <CDropdownToggle color="primary" variant="outline">
                            {t("General.buttons.actions")}
                          </CDropdownToggle>
                          <CDropdownMenu placement="right-end">
                            <CDropdownItem onClick={()=>{this.props.sendInvitations(item,'cancel')}}>{t("Meetings.buttons.notify_attendees")}</CDropdownItem>
                            {item.communications.length > 0 &&
                              <CDropdownItem onClick={()=>{this.props.showCommunications(item)}}>{t("Meetings.buttons.communication_history")}</CDropdownItem>
                            }
                            <CDropdownDivider />
                            <CDropdownItem onClick={()=>{this.restore(item)}}>{t("General.buttons.restore")}</CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </td>
                      )
                }
          }}
        />

        </>
      );
  }
}


Cancelled.propTypes = propTypes;
Cancelled.defaultProps = defaultProps;


export default withTranslation()(Cancelled);
