import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CFormGroup, CInputRadio, CLabel,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CRow,
  } from '@coreui/react';

import { withTranslation } from 'react-i18next';
import _ from "lodash";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class VoteItem extends Component {
  constructor(props){
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      values: {
        title: '',
        description: '',
        type: 'yes_no',
        number: 3,
        options: []
      },
      item: ''
    }
  }

  componentDidUpdate (prevProps, prevStates)  {
    if(prevProps.modal.show !== this.props.modal.show)
    {
      var state = this.state;
      if(this.props.modal.show)
      {
          state.values = {
            title: this.props.modal.vote.title,
            description: this.props.modal.vote.description,
            type: this.props.modal.vote.type,
            number: this.props.modal.vote.number,
            options: this.props.modal.vote.options,
          }
        this.setState(state);
      }
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state[name] = value;
    this.setState(state);
  }


  submit = () => {
    this.props.voteSubmit(this.state.item);
  }


  render() {
    const {t, modal} = this.props;
    const {values, item} = this.state;

    return (
        <CModal
              show={modal.show}
              onClose={this.props.closeVote}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{t("Votes.titles.submit_vote")}</h3></CModalHeader>
              <CModalBody>
                <CRow>
                    <CCol className="col-1"></CCol>
                    <CCol className="col-10 text-center font-weight-bold">
                        {values.title}
                    </CCol>
                </CRow>

                <CRow className="mt-1">
                    <CCol className="col-1"></CCol>
                    <CCol className="col-10 text-center">
                        {values.description}
                    </CCol>
                </CRow>

                <CRow className="mt-3">
                    <CCol className="col-4"></CCol>
                    <CCol className="col-5 text-left">
                        {values.type === 'yes_no' &&
                        <>
                          <CFormGroup variant="custom-radio" inline>
                            <CInputRadio custom id="inline-radio_yes" name="item" value="yes" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_yes">{t("General.labels.yes")}</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="ml-3" inline>
                            <CInputRadio custom id="inline-radio_no" name="item" value="no" onClick={(e) => this.handleInputChange(e)}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_no">{t("General.labels.no")}</CLabel>
                          </CFormGroup>
                        </>
                        }
                        {values.type === 'percentage' &&
                        <>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_20" name="item" value="20%" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_20">20%</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_40" name="item" value="40%" onClick={(e) => this.handleInputChange(e)}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_40">40%</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_60" name="item" value="60%" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_60">60%</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_80" name="item" value="80%" onClick={(e) => this.handleInputChange(e)}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_80">80%</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_100" name="item" value="100%" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_100">100%</CLabel>
                          </CFormGroup>
                        </>
                        }
                        {values.type === 'levels' &&
                        <>
                          <CFormGroup variant="custom-radio" className="mt-1" inline>
                            <CInputRadio custom id="inline-radio_vl" name="item" value="very_low" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_vl">{t("Votes.labels.very_low")}</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_l" name="item" value="low" onClick={(e) => this.handleInputChange(e)}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_l">{t("Votes.labels.low")}</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_m" name="item" value="moderate" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_m">{t("Votes.labels.moderate")}</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_h" name="item" value="high" onClick={(e) => this.handleInputChange(e)}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_h">{t("Votes.labels.high")}</CLabel>
                          </CFormGroup>
                          <CFormGroup variant="custom-radio" className="mt-1">
                            <CInputRadio custom id="inline-radio_vh" name="item" value="very_high" onClick={(e) => this.handleInputChange(e)} />
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio_vh">{t("Votes.labels.very_high")}</CLabel>
                          </CFormGroup>
                        </>
                        }
                        {values.type === 'custom' &&
                        <>
                          {_.times(values.number, (i) => (
                              <CFormGroup variant="custom-radio" className="mt-1" key={"child-"+i}>
                                <CInputRadio custom id={"input_radio_"+i} name="item" value={values.options[i]} onClick={(e) => this.handleInputChange(e)} />
                                <CLabel variant="custom-checkbox" htmlFor={"input_radio_"+i}>{values.options[i]}</CLabel>
                              </CFormGroup>
                          ))}
                        </>
                        }
                    </CCol>
                </CRow>

              </CModalBody>
              <CModalFooter>
                  <CButton color="primary" disabled={item === '' ? true : false} className="px-4" onClick={this.submit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeVote}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

VoteItem.propTypes = propTypes;
VoteItem.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(VoteItem));
