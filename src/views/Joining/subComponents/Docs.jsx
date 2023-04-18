import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CAlert,
  CButton,
  CInputGroup, CInputGroupPrepend, CInputGroupText, CInput,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CRow, CCol,
  } from '@coreui/react';

import { withTranslation } from 'react-i18next';

import _ from 'lodash';

import 'react-images-upload/index.css';


var auth = require("./../../../services/Auth");

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Docs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errors: [],
      loading: false
    }

    this.uploadFile = this.uploadFile.bind(this);
    this.getSubmitStatus = this.getSubmitStatus.bind(this);

    this.updateMeetingDoc = this.updateMeetingDoc.bind(this);
    this.deleteMeetingDoc = this.deleteMeetingDoc.bind(this);
    this.meetingDocUpdated = this.meetingDocUpdated.bind(this);

    this.maxSize = parseInt(process.env.REACT_APP_FILE_MAX_SIZE) * 1000 * 1000;
    this.allowedTypes = [
      'text/plain', //.txt
      'text/csv', //.csv
      'application/pdf', //.pdf
      'application/msword', //.doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', //.docx
      'application/vnd.ms-excel', //.xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', //.xslx
      'application/vnd.ms-powerpoint', //.ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', //.pptx
      'application/vnd.oasis.opendocument.text', //.odt
      'application/vnd.oasis.opendocument.spreadsheet', //.ods
      'application/vnd.oasis.opendocument.presentation', //.odp
      'image/jpeg', //.jpeg, .jpg
      'image/gif', //.gif
      'image/png' //.png
    ];
    this.allowedExtensions = ['.txt', '.csv', '.pdf', '.doc', '.docx', '.xls' , '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.jpeg', '.jpg', '.gif', '.png'];
    this.inputRef = React.createRef();
  }

  async uploadFile(event) {
    var state = this.state;
    var file = event.target.files[0];

    if(this.allowedTypes.indexOf(file.type) >= 0 && file.size <= this.maxSize)
    {
        state.errors.file = false;
        state.loading = true;
        this.setState(state);

        var formData = new FormData();
        formData.append('file', file);
        var res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_UPLOAD),
                              auth.getRequestInitFile('post', formData));
        var status = res.status;
        res = await res.json();
        if(status === 200)
        {
          this.props.setMeetingDocModalState('from_file_add',{
            url: res.file,
            name: file.name,
            type: file.type
          });
        }
        else
        {
            state.errors = res.errors;
        }
        state.loading = false;
        this.setState(state);
    }
    else
    {
      state.errors.file = this.allowedTypes.indexOf(this.props.meetingsDoc.url.type) >= 0 ? "Docs.errors.file_too_large" : "Docs.errors.file_type";
    }
    this.setState(state);
  }

  getSubmitStatus = () => {
    const {meetingDoc} = this.props;
    var status = false;

    if(!meetingDoc.name.match(/[A-Za-z0-9]/))
    {
      status = true;
    }

    if(meetingDoc.type === "link" && !_.isArray(meetingDoc.url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g)) )
    {
        status = true;
    }

    return status;
  }

  updateMeetingDoc = () => {
    this.props.socket.emit("meetingDoc", this.props.meetingDoc, (res) => this.meetingDocUpdated(res));
    this.props.closeMeetingDoc();
  }

  deleteMeetingDoc = () => {
    this.props.socket.emit("deleteMeetingDoc",this.props.meetingDoc, (res) => this.meetingDocUpdated(res));
    this.props.closeMeetingDoc();
  }

  meetingDocUpdated = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.meeting_docs_not_updated");
    }
  }

  render() {
    const {showMeetingDoc, meetingDoc, meetingDocModalState, t} = this.props;
    const {loading, errors} = this.state;

    return (
        <CModal
              show={showMeetingDoc}
              onClose={this.props.closeMeetingDoc}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{!_.isNull(meetingDoc) && !_.isUndefined(meetingDoc.created) ? t("Execution.titles.edit_document") : t("Execution.titles.additional_document")}</h3></CModalHeader>
              <CModalBody>
                {meetingDocModalState === "from_file" &&
                  <CRow className="bg-gradient-light">
                    <CCol className="col-1"></CCol>
                    <CCol className="text-center col-10">
                      <div className="text-center">
                        {loading
                        ? <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>
                        :
                        <div className="fileUploader">
                          {errors.file &&
                            <CAlert className="alert-danger fade show" role="alert">{t(errors.file)}</CAlert>
                          }
                          <div className="fileContainer">
                              <img src="/static/media/UploadIcon.1cedb6e9.svg" alt={t("Docs.labels.upload_file")} />
                              <p className="text-dark">{t("Docs.labels.file_too_large",{var: process.env.REACT_APP_FILE_MAX_SIZE})} <br/>{t("Docs.labels.file_type",{var: this.allowedExtensions.join(', ')})}</p>
                              <button type="button" onClick={() => {this.inputRef.current.click()}} className="chooseFileButton">{t("Docs.labels.upload_file")}</button>
                              <input ref={this.inputRef} onChange={this.uploadFile} type="file" accept={this.allowedExtensions.join() + "," + this.allowedTypes.join()} />
                          </div>
                        </div>
                        }
                      </div>
                    </CCol>
                  </CRow>
                }

                {meetingDocModalState === "from_file_add" &&
                  <CRow>
                    <CCol className="text-center col-12">
                      <CInputGroup className="mb-1">
                          <CInputGroupPrepend>
                              <CInputGroupText>
                                {t("Docs.labels.filename")}
                              </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                              type="text"
                              name="name"
                              placeholder="..."
                              value={meetingDoc.name}
                              autoComplete="off"
                              onChange={(e) => this.props.handleInputModal('meetingDoc', e)}
                              maxLength="100"
                              className={(!_.isNull(meetingDoc.name) && !meetingDoc.name.match(/[A-Za-z0-9]/)) ? "is-invalid" : "is-valid"}
                          />
                        </CInputGroup>
                    </CCol>
                  </CRow>
                }

                {meetingDocModalState === "from_url" &&
                  <CRow>
                    <CCol className="text-center">
                        <CInputGroup className="mb-2">
                            <CInput
                              type="text"
                              name="name"
                              placeholder={t("Docs.labels.filename")}
                              value={meetingDoc.name}
                              autoComplete="off"
                              onChange={(e) => this.props.handleInputModal('meetingDoc', e)}
                              maxLength="100"
                              size="sm"
                              className={(!_.isNull(meetingDoc.name) && !meetingDoc.name.match(/[A-Za-z0-9]/)) ? "is-invalid" : "is-valid"}
                            />
                            <CInput
                              type="text"
                              name="url"
                              placeholder={t("Docs.labels.add_link")}
                              value={meetingDoc.url}
                              autoComplete="off"
                              onChange={(e) => this.props.handleInputModal('meetingDoc', e)}
                              maxLength="200"
                              size="sm"
                              className={!_.isNull(meetingDoc.url) && !meetingDoc.url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g) ? "is-invalid" : "is-valid"}
                            />

                        </CInputGroup>
                    </CCol>
                  </CRow>
                }
              </CModalBody>
              <CModalFooter>
                  {!_.isNull(meetingDoc) && !_.isUndefined(meetingDoc.created) &&
                    <CButton color="danger" className=" mr-5" onClick={this.deleteMeetingDoc}>{t("General.buttons.delete")}</CButton>
                  }
                  {(meetingDocModalState === "from_file_add" || meetingDocModalState === "from_url") &&
                    <CButton color="primary" disabled={this.getSubmitStatus()} className="px-4" onClick={this.updateMeetingDoc}>{t("General.buttons.submit")}</CButton>
                  }
                  <CButton
                    color="secondary"
                    onClick={this.props.closeMeetingDoc}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

Docs.propTypes = propTypes;
Docs.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Docs));
