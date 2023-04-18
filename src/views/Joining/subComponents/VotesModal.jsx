import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CInput, CSelect,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CTextarea,
  CRow,
  } from '@coreui/react';

import { withTranslation } from 'react-i18next';
import _ from "lodash";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class VotesModal extends Component {
  constructor(props){
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOptions = this.handleOptions.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      values: {
        title: '',
        description: '',
        type: 'yes_no',
        number: 2,
        options: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
      }
    }
  }

  componentDidUpdate (prevProps, prevStates)  {
    if(prevProps.modal.show !== this.props.modal.show)
    {
      var state = this.state;
      if(this.props.modal.show)
      {
        if(this.props.modal.action === 'edit'){
          state.values = {
            title: this.props.modal.vote.title,
            description: this.props.modal.vote.description,
            type: this.props.modal.vote.type,
            number: this.props.modal.vote.number,
            options: this.props.modal.vote.options,
          }
        }
        else
        {
          state.values = {
            title: '',
            description: '',
            type: 'yes_no',
            number: 2,
            options: ["", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", "", "", ""]
          }
        }
        this.setState(state);
      }
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    this.setState(state);
  }

  handleOptions = (key, value) => {
    var state = this.state;
    state.values.options[key] = value;
    this.setState(state);
  }

  submit = () => {
    this.props.infoSubmit(this.state.values);
  }

  getSubmitStatus = (values) => {
    var disabled = false;
    if(!values.title.match(/[0-9A-Za-z]/))
    {
      disabled = true;
    }

    if(values.type === 'custom')
    {
      for(var i=0; i < values.number; i++){
        if(_.isUndefined(values.options[i]) || (!_.isUndefined(values.options[i]) && !values.options[i].match(/[0-9A-Za-z]/)))
        {
          disabled = true;
        }
      }
    }

    return disabled;
  }


  render() {
    const {t, modal} = this.props;
    const {values} = this.state;

    return (
        <CModal
              show={modal.show}
              onClose={this.props.closeInfo}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{modal.action === 'add' ? t("Votes.titles.additional_vote") : t("Votes.titles.edit_vote")}</h3></CModalHeader>
              <CModalBody>
                <CRow>
                    <CCol className="col-1"></CCol>
                    <CCol className="col-10">
                        <CInput
                            type="text"
                            name="title"
                            placeholder={t("Votes.labels.title")}
                            value={values.title}
                            autoComplete="off"
                            className={values.title.match(/[0-9A-Za-z]/) ? 'border-primary is-valid' : 'border-primary is-invalid'}
                            size="sm"
                            onChange={this.handleInputChange}
                            maxLength="100"
                          />
                    </CCol>
                </CRow>
                <CRow className="mt-1">
                    <CCol className="col-1"></CCol>
                    <CCol className="col-10">
                        <CTextarea
                            type="text"
                            name="description"
                            placeholder={t("Votes.labels.description")}
                            value={values.description}
                            autoComplete="off"
                            className="border-primary"
                            size="sm"
                            onChange={this.handleInputChange}
                          />
                    </CCol>
                </CRow>
                <CRow className="mt-1">
                    <CCol className="col-1"></CCol>
                    <CCol className="col-5">
                      {t("Votes.labels.type")}
                    </CCol>
                    <CCol className="col-5">
                        <CSelect
                            type="text"
                            name="type"
                            value={values.type}
                            className="border-primary"
                            size="sm"
                            custom
                            onChange={this.handleInputChange}
                          >
                          <option value="yes_no">{t("Votes.labels.type_yes_no")}</option>
                          <option value="percentage">{t("Votes.labels.type_percentage")}</option>
                          <option value="levels">{t("Votes.labels.type_levels")}</option>
                          <option value="custom">{t("Votes.labels.type_custom")}</option>
                        </CSelect>
                    </CCol>
                </CRow>
                {values.type === 'custom' &&
                <>
                  <CRow className="mt-1">
                      <CCol className="col-1"></CCol>
                      <CCol className="col-5">
                        {t("Votes.labels.number")}
                      </CCol>
                      <CCol className="col-5">
                          <CSelect
                              type="text"
                              name="number"
                              value={values.number}
                              className="border-primary"
                              size="sm"
                              custom
                              onChange={this.handleInputChange}
                            >
                            {_.times(20, (value) => (
                              <option value={value} key={'VoteOption-'+value}>{value}</option>
                            ))}
                          </CSelect>
                      </CCol>
                  </CRow>
                  {_.times(values.number, (i) => (
                    <CRow className="mt-1" key={'Option'+i} >
                      <CCol className="col-3"></CCol>
                      <CCol className="col-3">
                        {(i+1)+"/"}
                      </CCol>
                      <CCol className="col-5">
                          <CInput
                            type="text"
                            placeholder={t("Votes.labels.option") + (i+1)}
                            value={values.options[i]}
                            autoComplete="off"
                            size="sm"
                            onChange={(e) => this.handleOptions(i,e.target.value)}
                            className={!_.isUndefined(values.options[i]) && values.options[i].match(/[0-9A-Za-z]/) ? 'border-primary is-valid' : 'border-primary is-invalid'}
                            maxLength="100"
                          />
                      </CCol>
                  </CRow>
                  ))}
                </>
                }

              </CModalBody>
              <CModalFooter>
                  {this.props.modal.action === 'edit' &&
                    <CButton color="danger" className=" mr-5" onClick={this.props.infoDelete}>{t("General.buttons.delete")}</CButton>
                  }

                  <CButton color="primary" disabled={this.getSubmitStatus(values)} className="px-4" onClick={this.submit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeInfo}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

VotesModal.propTypes = propTypes;
VotesModal.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(VotesModal));
