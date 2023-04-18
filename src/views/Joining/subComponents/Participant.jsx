import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CAlert,
  CButton,
  CInputGroup,CInputGroupPrepend,
  CInputGroupText,
  CModal, CModalHeader, CModalBody, CModalFooter,
  CSelect
} from '@coreui/react';
import {
    CIcon
  } from '@coreui/icons-react';

  //React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

import { withTranslation } from 'react-i18next';

import _ from 'lodash';

var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Participant extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getColleagues = this.getColleagues.bind(this);
    this.addParticipant = this.addParticipant.bind(this);
    this.meetingParticipantsUpdated = this.meetingParticipantsUpdated.bind(this);

    this.state = {
      values: {
        email: "",
        type: "guest",
        presence: "required"
      },
      errors: {},
      colleagues: [],
      selectableColleagues: []
    };

    this.getColleagues();
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    state.errors[name] = false;
    this.setState(state);
  }

  onChange = (name, value) => {
    this.handleInputChange({target: {name: name, value: value}});
  }

  getColleagues(){
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_COLLEAGUES), auth.getRequestInit('get', null))
    .then(async res => {
      state.status = res.status;
      return await res.json();
    })
    .then(data => {
      state.colleagues = data.users;
      state.selectableColleagues = this.getSelectableColleagues(this.props.attendees, state.colleagues);
      this.setState(state);
    })
    .catch(err => {
      console.log(err);
    });
  }

  getSelectableColleagues(attendees, colleagues){
    var participants = [];
    var selectableColleagues = [];

    attendees.map((attendee) => (
      participants.push(attendee.email)
    ));
    for(var i=0; i< colleagues.length; i++){
      var col = colleagues[i];
      if(participants.indexOf(col.email) < 0 )
      {
          selectableColleagues.push({
            value: col.email,
            label: col.fullName,
            id: col.id
          });
      }
    }

    return _.orderBy(selectableColleagues, ['label'],['asc']);
  }

  addParticipant = () => {
    var state = this.state;

    if(_.isNull(state.values.email) || _.isEmpty(state.values.email))
    {
        state.errors.email = "select_participant";
    }
    else
    {
      state.values.fullName = state.values.email.label;
      state.values.user = state.values.email.id;
      state.values.email = state.values.email.value;

      this.props.socket.emit("additionalParticipant", state.values, (res) => this.meetingParticipantsUpdated(res, state.values.email));
      this.props.additionalParticipant(false);

      state = {
        values: {
          email: "",
          type: "guest",
          presence: "required"
        },
        errors: {},
      };
    }

    this.setState(state);
  }

  meetingParticipantsUpdated = (res, email) => {
    var state = this.state;
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.meeting_participants_not_updated");
    }
    else
    {
      var tbd = 0;
      for(var i=0; i < state.selectableColleagues.length; i++)
      {
        if(state.selectableColleagues[i].email === email)
        {
          tbd = i;
        }
      }
      state.selectableColleagues.splice(tbd, 1);

      this.setState(state);
      this.props.notify("info","Execution.msgs.meeting_participants_updated_successfully");
    }
  }


  render() {
    const {showAdditionalParticipant, t} = this.props;
    const {selectableColleagues, values, errors} = this.state;

    return (
        <CModal
              show={showAdditionalParticipant}
              onClose={() => this.props.additionalParticipant(false)}
              centered={true}
              fade={true}
            >
              <CModalHeader closeButton><h3>{t("Execution.titles.additional_participant")}</h3></CModalHeader>
              <CModalBody>
                     <CInputGroup className="mb-1">
                         <CInputGroupPrepend>
                             <CInputGroupText>
                               <CIcon name="cil-user" />
                             </CInputGroupText>
                         </CInputGroupPrepend>
                         <Select
                             name="form-field-name2"
                             value={values.email}
                             options={selectableColleagues}
                             placeholder="..."
                             onChange={(value) => this.onChange("email", value)}
                             className="col-6"
                         />
                         <CSelect
                           name="type"
                           custom
                           className="text-left col-3"
                           value={values.type}
                           onChange={this.handleInputChange}
                         >
                           <option value="guest">{t("Attendees.labels.guest")}</option>
                           <option value="coHost">{t("Attendees.labels.coHost")}</option>
                         </CSelect>
                         <CSelect
                           name="presence"
                           custom
                           className="text-left col-3"
                           value={values.presence}
                           onChange={this.handleInputChange}
                         >
                           <option value="required">{t("Attendees.labels.required")}</option>
                           <option value="optional">{t("Attendees.labels.optional")}</option>
                         </CSelect>
                     </CInputGroup>
                     {errors.email &&
                       <CAlert className="alert-danger font-sm">{t("Attendees.errors." + errors.email)}</CAlert>
                     }
              </CModalBody>
              <CModalFooter>
                  <CButton color="primary" className="px-4" onClick={this.addParticipant}>{t("General.buttons.submit")}</CButton>
                  <CButton
                    color="secondary"
                    onClick={() => this.props.additionalParticipant(false)}
                  >{t("General.buttons.cancel")}</CButton>
              </CModalFooter>
        </CModal>
    );
  }
}

Participant.propTypes = propTypes;
Participant.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Participant));
