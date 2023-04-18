import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CBadge,
  CButton,
  CInputGroup,CInputGroupPrepend, CInput,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CSelect
  } from '@coreui/react';

import { withTranslation } from 'react-i18next';

import _ from 'lodash';


var meetingsHelper = require('./../../../services/Meetings');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Objectives extends Component {
  constructor(props){
    super(props);

    this.updateMeetingObjective = this.updateMeetingObjective.bind(this);
    this.deleteAdditionalMeetingObjective = this.deleteAdditionalMeetingObjective.bind(this);
    this.meetingObjectiveUpdated = this.meetingObjectiveUpdated.bind(this);
  }

  updateMeetingObjective = () => {
    this.props.socket.emit("meetingObjective", this.props.meetingObjective, (res) => this.meetingObjectiveUpdated(res));
    this.props.closeMeetingObjective();
  }

  deleteAdditionalMeetingObjective = () => {
    this.props.socket.emit("deleteMeetingObjective",this.props.meetingObjective, (res) => this.meetingObjectiveUpdated(res));
    this.props.closeMeetingObjective();
  }

  meetingObjectiveUpdated = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.meeting_objectives_not_updated");
    }
  }


  render() {
    const {showMeetingObjective, meetingObjective, meetingObjectiveModalState, t} = this.props;

    return (
        <CModal
              show={showMeetingObjective}
              onClose={this.props.closeMeetingObjective}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{meetingObjectiveModalState ? t("Execution.titles.additional_objective") : t("Execution.titles.manage_meeting_objective")}</h3></CModalHeader>
              <CModalBody>
                      {!_.isNull(meetingObjective)
                      ?
                        <CInputGroup className="col-12">
                          {meetingObjectiveModalState
                          ?<>
                            <CInput
                              type="text"
                              name="item"
                              placeholder={t("Execution.labels.additional_objective")}
                              value={meetingObjective.item}
                              autoComplete="off"
                              onChange={(e) => this.props.handleInputModal('meetingObjective', e)}
                              maxLength="100"
                              size="sm"
                              className={(!_.isNull(meetingObjective) && !meetingObjective.item.match(/[A-Za-z0-9]/)) ? "is-invalid" : "is-valid"}
                            />
                            <CSelect
                              name="priority"
                              custom
                              size="sm"
                              className="text-left col-3 ml-1"
                              value={meetingObjective.priority}
                              onChange={(e) => this.props.handleInputModal('meetingObjective', e)}
                              >
                                  <option value="p1">{t("Goals.labels.p1")}</option>
                                  <option value="p3">{t("Goals.labels.p3")}</option>
                                  <option value="p5">{t("Goals.labels.p5")}</option>
                              </CSelect>
                            </>
                          :
                            <CInputGroupPrepend className="col-9">
                              {meetingObjective.item}
                              <CBadge color={meetingsHelper.getGoalClass(meetingObjective.priority)} className="ml-1 mr-2 mt-1 mb-1" size="sm">{t("Goals.labels." + meetingObjective.priority)}</CBadge>
                            </CInputGroupPrepend>
                          }
                          <CSelect
                                  custom
                                  name="completed"
                                  size="sm"
                                  className="text-left col-2 mr-3"
                                  value={meetingObjective.completed}
                                  onChange={(e) => this.props.handleInputModal('meetingObjective', e)}
                                >
                                  <option value="0">0%</option>
                                  <option value="25">25%</option>
                                  <option value="50">50%</option>
                                  <option value="75">75%</option>
                                  <option value="100">100%</option>
                          </CSelect>
                        </CInputGroup>
                      : <></>
                      }
              </CModalBody>
              <CModalFooter>
                  {!_.isNull(meetingObjective) && meetingObjective.additional && !_.isUndefined(meetingObjective.id) &&
                    <CButton color="danger" className=" mr-5" onClick={this.deleteAdditionalMeetingObjective}>{t("General.buttons.delete")}</CButton>
                  }

                  <CButton color="primary" disabled={(!_.isNull(meetingObjective) && !meetingObjective.item.match(/[A-Za-z0-9]/)) ? true : false} className="px-4" onClick={this.updateMeetingObjective}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeMeetingObjective}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

Objectives.propTypes = propTypes;
Objectives.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Objectives));
