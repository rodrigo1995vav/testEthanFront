import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CModal, CModalHeader, CModalBody, CModalFooter,
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

class IdeationOpen extends Component {
  constructor(props){
    super(props);

    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
    this.getDisabled = this.getDisabled.bind(this);

    this.state = {
      list: [],
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
          this.setState(state);
        })
        .catch(err => {
          console.log(err);
        });
        this.setState(state);
      }
    }
  }


  onChange = (name, value) => {
    var state = this.state;
    state.ref = _.isNull(value) ? null : value.value;
    this.setState(state);
  }

  submit = () => {
    var state = this.state;
    this.props.closeIdeationOpen();
    fetch( auth.prepareURL(process.env.REACT_APP_API_URL_IDEATIONS_VIEW) + state.ref,
           auth.getRequestInit('get',null))
    .then(async res => {
        return await res.json();
    })
    .then(data => {
      if(state.status === 200){
        this.props.loadItems(data.ideation.items, state.ref);
        this.props.notify('success', 'Ideation.msgs.file_opened_successfully');
      }
      else
      {
        this.props.notify('danger', 'Ideation.msgs.unable_to_open_the_file');
      }
    })
    .catch(err => {
    });
  }

  getDisabled = () => {
    var state = this.state;
    return _.isNull(state.ref) ? true : false;
  }

  render() {
    const {t, modal} = this.props;
    const {list, ref} = this.state;

    return (
        <CModal
              show={modal.show}
              onClose={this.props.closeIdeationOpen}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{t("Ideation.titles.open")}</h3></CModalHeader>
              <CModalBody>
                <CRow>
                  <CCol className="col-1"></CCol>
                  <CCol className="col-10 text-center">
                          <Select
                             name="ref"
                             value={ref}
                             options={list}
                             placeholder={t("Ideation.labels.select_file_to_open")}
                             onChange={(value) => this.onChange("ref", value)}
                         />
                  </CCol>
                </CRow>
              </CModalBody>
              <CModalFooter>
                  <CButton color="primary" className="px-4" disabled={this.getDisabled()} onClick={this.submit}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={this.props.closeIdeationOpen}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

IdeationOpen.propTypes = propTypes;
IdeationOpen.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(IdeationOpen));
