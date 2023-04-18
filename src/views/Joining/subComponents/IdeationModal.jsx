import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CInput,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CSwitch,
  CTextarea,
  CRow,
  CBadge
  } from '@coreui/react';

import { withTranslation } from 'react-i18next';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class IdeationModal extends Component {
  constructor(props){
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateFlag = this.updateFlag.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      values: {
        title: '',
        subtitle: '',
        flagged: false
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
            title: this.props.modal.node.title,
            subtitle: this.props.modal.node.subtitle,
            flagged: this.props.modal.node.flagged
          }
        }
        else
        {
          state.values = {
            title: '',
            subtitle: '',
            flagged: false
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

  updateFlag = (value) => {
    var state = this.state;
    state.values['flagged'] = value;
    this.setState(state);
  }

  submit = () => {
    this.props.nodeSubmit(this.state.values);
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
              <CModalHeader closeButton><h3>{modal.action === 'add' ? t("Ideation.titles.additional_node") : t("Ideation.titles.edit_node")}</h3></CModalHeader>
              <CModalBody>
                <CRow>
                    <CCol className="col-1"></CCol>
                    <CCol className="col-10">
                        <CInput
                            type="text"
                            name="title"
                            placeholder={t("Ideation.labels.title")}
                            value={values.title}
                            autoComplete="off"
                            className="border-primary"
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
                            name="subtitle"
                            placeholder={t("Ideation.labels.description")}
                            value={values.subtitle}
                            autoComplete="off"
                            className="border-primary"
                            size="sm"
                            onChange={this.handleInputChange}
                          />
                    </CCol>
                </CRow>
                <CRow className="mt-1">
                    <CCol className="col-1"></CCol>
                    <CCol className="col-5"><CBadge color="warning" size="sm">{t("Ideation.labels.flag")}</CBadge></CCol>
                    <CCol className="col-5 text-right">
                        <CSwitch  shape="pill"
                          variant='opposite' onCheckedChange={(value)=> this.updateFlag(value)}
                          color="primary" size="sm" labelOn={t("General.labels.yes")} labelOff={t("General.labels.no")}
                          checked={values.flagged} />
                    </CCol>
                </CRow>
              </CModalBody>
              <CModalFooter>
                  {this.props.modal.action === 'edit' &&
                    <CButton color="danger" className=" mr-5" onClick={this.props.nodeDelete}>{t("General.buttons.delete")}</CButton>
                  }

                  <CButton color="primary" disabled={!values.title.match(/[A-Za-z0-9]/) ? true : false} className="px-4" onClick={this.submit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeInfo}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

IdeationModal.propTypes = propTypes;
IdeationModal.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(IdeationModal));
