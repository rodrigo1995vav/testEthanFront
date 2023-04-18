import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CBadge,
  CImg,
  CButton,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CRow,
  CCol
} from '@coreui/react';
import { CTextarea } from '@coreui/react/lib/CInput';

import { withTranslation } from 'react-i18next';
import MomentTZ from 'moment-timezone';

import _ from 'lodash';

const nl2br = require('react-nl2br');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Question extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitReply = this.submitReply.bind(this);

    this.state = {
      reply: "",
    };
  }

  handleInputChange = (event) => {
    const { value } = event.target;
    var state = this.state;
    state.reply = value;
    this.setState(state);
  }

  submitReply = () => {
    this.props.socket.emit("answerQuestion",{question: this.props.question, answer: this.state.reply}, (res) => this.replySubmitted(res));
  }

  replySubmitted = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.answer_not_submitted");
    }
    else
    {
      var state = this.state;
      state.reply = "";
      this.setState(state);
      this.props.reply(null, false);
    }
  }

  render() {
    const {showReply, question, attendees, participants, user, t} = this.props;
    const {reply} = this.state;

    return (
        <CModal
              show={showReply}
              onClose={() => this.props.reply(null, false)}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{t("Execution.titles.reply")}</h3></CModalHeader>
              {!_.isNull(question) &&
              <CModalBody>
                <CRow>
                      <div className="message col-12">
                        <div className="mr-3 float-left">
                          <div className="c-avatar text-center bg-gradient-dark text-light">
                            {attendees[question.email].picture
                            ? <CImg
                              className="c-avatar-img"
                              src={process.env.REACT_APP_AVATAR_URL + attendees[question.email].picture}
                              alt={question.email}
                              />
                            : attendees[question.email].initials
                            }
                            <CBadge color={participants.indexOf(question.email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                          </div>
                        </div>
                        <div>
                          <small className="text-muted">{MomentTZ(question.datetime).tz(user.timezone).format('LT')}</small>
                          <small className="text-muted float-right mt-1">{attendees[question.email].fullName}</small>
                        </div>
                        <small className="text-muted font-weight-bold">{nl2br(question.question)}</small>
                      </div>
                </CRow>
                <hr/>
                {question.answers.map((item, index) => (
                  <div key={"qAnswer-"+index}>
                    <div className="message">
                      <div className="ml-3 float-right">
                        <div className="c-avatar text-center bg-gradient-dark text-light">
                          {attendees[item.email].picture
                          ? <CImg
                            className="c-avatar-img"
                            src={process.env.REACT_APP_AVATAR_URL + attendees[item.email].picture}
                            alt={item.email}
                            />
                          : attendees[item.email].initials
                          }
                          <CBadge color={participants.indexOf(item.email) < 0 ? "dark" : "success" } className="c-avatar-status"> </CBadge>
                        </div>
                      </div>
                      <div>
                        <small className="text-muted">{MomentTZ(item.datetime).tz(user.timezone).format('LT')}</small>
                        <small className="text-muted float-right mt-1">{attendees[item.email].fullName}</small>
                      </div>
                      <small className="text-muted">{nl2br(item.answer)}</small>
                    </div>
                    <hr/>
                  </div>
                ))}
                <CRow>
                  <CCol className="col-1"></CCol>
                  <CCol className="col-10">
                      <CTextarea
                          type="text"
                          name="reply"
                          placeholder={t("Execution.labels.reply") + "..."}
                          value={reply}
                          autoComplete="off"
                          className="border-primary"
                          size="sm"
                          onChange={this.handleInputChange}
                        />
                  </CCol>
                </CRow>
              </CModalBody>
              }
              <CModalFooter>
                  <CButton color="primary" onClick={() => this.submitReply()} disabled={(!reply.match(/[A-Za-z0-9]/)) ? true : false}  className="px-4">{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={() => this.props.reply(null, false)}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

Question.propTypes = propTypes;
Question.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Question));
