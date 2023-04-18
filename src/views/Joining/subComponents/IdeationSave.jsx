import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CInput,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CSwitch,
  CRow
  } from '@coreui/react';

import { withTranslation } from 'react-i18next';

import _ from 'lodash';

//React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';


var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class IdeationSave extends Component {
  constructor(props){
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onChange = this.onChange.bind(this);

    this.submit = this.submit.bind(this);
    this.getDisabled = this.getDisabled.bind(this);

    this.state = {
      list: [],
      saveAsNew: true,
      name: '',
      ref: null,
    }
  }

  componentDidUpdate (prevProps, prevStates)  {
    if(prevProps.modal.show !== this.props.modal.show)
    {
      var state = this.state;
      if(this.props.modal.show)
      {
        fetch(auth.prepareURL(process.env.REACT_APP_API_URL_IDEATIONS_LIST), auth.getRequestInit('post', null))
        .then(async res => {
          state.status = res.status;
          return await res.json();
        })
        .then(data => {
          state.list = data.ideations;
          data.ideations.map((ideation, index) => {
            state.list.push({
              value: ideation.id,
              label: ideation.name
            });
            return true;
          });
          if(!_.isNull(this.props.open.ref)){
            state.ref = this.props.open.ref;
            state.saveAsNew = false;
          }
          this.setState(state);
        })
        .catch(err => {
          console.log(err);
        });
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

  onChange = (name, value) => {
    var state = this.state;
    state.ref = _.isNull(value) ? null : value.value;
    this.setState(state);
  }

  submit = () => {
    var state = this.state;
    var url = process.env.REACT_APP_API_URL_IDEATIONS_INSERT;
    if(!state.saveAsNew)
    {
      url = process.env.REACT_APP_API_URL_IDEATIONS_UPDATE + state.ref;
    }
    this.props.closeSave();
    fetch( auth.prepareURL(url),
           auth.getRequestInit(state.saveAsNew ? 'post' : 'put',
           state.saveAsNew ? {name: state.name, items: this.props.modal.items} : {items: this.props.modal.items} ))
    .then(async res => {
        if(res.status === 200)
        {
          this.props.notify('success', 'Ideation.msgs.file_saved_successfully');
        }
        else
        {
          this.props.notify('danger', 'Ideation.msgs.file_not_saved');
        }
        return await res.json();
    })
    .catch(err => {
    });
  }

  getDisabled = () => {
    var state = this.state;
    if(state.saveAsNew){
      return !state.name.match(/[A-Za-z0-9]/) ? true : false;
    } else {
      return _.isNull(state.ref) ? true : false;
    }
  }

  render() {
    const {t, modal} = this.props;
    const {saveAsNew, name, list, ref} = this.state;

    return (
        <CModal
              show={modal.show}
              onClose={this.props.closeSave}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{t("Ideation.titles.save")}</h3></CModalHeader>
              <CModalBody>
                <CRow className="mb-1">
                      <CCol className="col-1"></CCol>
                      <CCol className="col-5">{t("Ideation.labels.save_as_new")}</CCol>
                      <CCol className="col-5 text-right">
                          <CSwitch  shape="pill"
                            variant='opposite' onCheckedChange={(value)=> this.setState({saveAsNew: value})}
                            color="primary" size="sm" labelOn={t("General.labels.yes")} labelOff={t("General.labels.no")}
                            checked={saveAsNew} />
                      </CCol>
                </CRow>
                {saveAsNew
                ? <CRow>
                    <CCol className="col-1"></CCol>
                    <CCol className="col-10">
                        <CInput
                            type="text"
                            name="name"
                            placeholder={t("Ideation.labels.name")}
                            value={name}
                            autoComplete="off"
                            className="border-primary"
                            size="sm"
                            onChange={this.handleInputChange}
                            maxLength="100"
                          />
                    </CCol>
                  </CRow>
                :
                <CRow>
                  <CCol className="col-1"></CCol>
                  <CCol className="col-10 text-center">
                          <Select
                             name="ref"
                             value={ref}
                             options={list}
                             placeholder={t("Ideation.labels.select_file_to_override")}
                             onChange={(value) => this.onChange("ref", value)}
                         />
                  </CCol>
              </CRow>
                }


              </CModalBody>
              <CModalFooter>
                  <CButton color="primary" className="px-4" disabled={this.getDisabled()} onClick={this.submit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeSave}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

IdeationSave.propTypes = propTypes;
IdeationSave.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(IdeationSave));
