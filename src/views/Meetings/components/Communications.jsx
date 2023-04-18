import React, { Component } from 'react';

import {
  CBadge,
  CButton,
  CLabel,
  CModal,CModalHeader,CModalBody,CModalFooter,
  CSelect
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import MomentTZ from 'moment-timezone';
import renderHTML from 'react-render-html';
import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import _ from 'lodash';

var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Communications extends Component {
  constructor(props){
    super(props);
    this.state = {
      index: 0
    }
    this.ref = React.createRef();
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.show !== this.props.show)
    {
      if(!this.props.show)
      {
        this.ref.current.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });

        var state = this.state;
        state.index = 0;
        this.setState(state);
      }
    }
  }

  onChange = (e) => {
    this.setState({
      index: e.target.value
    });
    this.ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  render() {
    const {t, show, meeting, timezone} = this.props;
    const {index} = this.state;

    if(_.isNull(meeting) || (!_.isNull(meeting) && meeting.communications.length === 0))
    {
      return null;
    }

    return (
        <CModal
              show={show}
              onClose={this.props.closeCommunications}
              centered={true}
              fade={true}
              size="lg"
            >
              <CModalHeader closeButton>
                <CLabel className="font-weight-bold">{meeting.subject}</CLabel>
                <CLabel className="ml-2 mr-2"><CIcon name="cil-calendar" className="mr-1" size="sm"/> {MomentTZ(meeting.datetime).tz(timezone).format('LL')}</CLabel>
                <CLabel className="mr-2"><CIcon name="cil-clock" className="mr-1" size="sm"/>{MomentTZ(meeting.datetime).tz(timezone).format('LT')} - {MomentTZ(meeting.datetime).tz(timezone).add(meeting.duration,"minutes").format('LT')} ({meetingsHelper.convertDuration(meeting.duration)})</CLabel>
              </CModalHeader>
              <CModalBody>
                <CSelect custom className="primary" name="index" onChange={this.onChange} value={index}>
                  {meeting.communications.map((com, i) => (
                      <option value={i} key={"select-"+i}>{t("Invitations.labels.sent_on") + " " + MomentTZ(com.created).tz(timezone).format('LL @ LT')}</option>
                  ))}
                </CSelect>
                <hr />
                <div className="c-messages overflow-auto" style={{height: '300px'}}>
                  <div className="c-message">
                      <div className="c-message-details">
                        <div className="c-message-headers">
                          <div className="c-message-headers-subject" ref={this.ref}><b>{t("Invitations.labels.subject") +": "}</b> {meeting.communications[index].subject}</div>
                          <div className="c-message-headers-to"><b>{t("Invitations.labels.to") +": "}</b>
                            {meeting.communications[index].to.split(",").map((t, p) => (
                              <CBadge color="dark" key={"to-" + p} className="m-1" size="sm">{t}</CBadge>
                            ))}
                          </div>
                          <div className="c-message-headers-date"><b>{t("Invitations.labels.date") +": "}</b> {MomentTZ(meeting.communications[index].created).tz(timezone).format('LLL')}</div>
                        </div>
                        <hr />
                        <div className="c-message-body h-75">{renderHTML(meeting.communications[index].content)}</div>
                  </div>
                </div>
              </div>
              </CModalBody>
                <CModalFooter>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeCommunications}
                  >{t("General.buttons.close")}</CButton>
              </CModalFooter>
            </CModal>
    );
  }
}

Communications.propTypes = propTypes;
Communications.defaultProps = defaultProps;


export default withTranslation()(Communications);
