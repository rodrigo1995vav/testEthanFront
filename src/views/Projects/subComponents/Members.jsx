import React, { Component } from 'react';

import {
  CButton,
  CCard,CCardBody,
  CCol,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import _ from "lodash";

//React Select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';


var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Members extends Component {
  constructor(props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getColleagues = this.getColleagues.bind(this);

    this.state = {
      values: {
        email: ""
      },
      edit: false,
      colleagues: [],
      selectableColleagues: []
    }

    this.getColleagues();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.initializeComponents)
    {
      var state = this.state;
      state.values = {
        email: ""
      };
      state.edit = false;
      this.props.componentsInitialized();
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    this.setState(state);
  }

  onChange = (name, value) => {
    this.handleInputChange({target: {name: name, value: value}});
  }

  addItem = () => {
    var state = this.state;
    var items = this.props.members;

    if(state.edit !== false)
    {
        if(!_.isString(state.values.email))
        {
          items[state.edit].email = state.values.email.value;
          items[state.edit].fullName = state.values.email.label;
          items[state.edit].user = state.values.email.id;
        }
    }
    else
    {
          items.push({
            email: state.values.email.value,
            fullName: state.values.email.label,
            user: state.values.email.id
          });
    }

    state.selectableColleagues = this.getSelectableColleagues(items, state.colleagues);

    this.props.setMembers(items);

    state.values.email = "";
    state.edit = false;

    this.setState(state);
  }

  editItem = (index) => {
    var state = this.state;
    var items = _.clone(this.props.members);

    state.edit = index;
    state.values = {
      email: this.props.members[index].email,
    }

    items.splice(index,1);
    state.selectableColleagues = this.getSelectableColleagues(items, state.colleagues);

    this.setState(state);
  }

  deleteItem = (index) => {
    var items = this.props.members;
    var state = this.state;

    items.splice(index,1);
    state.selectableColleagues = this.getSelectableColleagues(items, state.colleagues);

    this.setState(state);
    this.props.setMembers(items);
  }

  getColleagues = () => {
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_COLLEAGUES), auth.getRequestInit('get', null))
    .then(async res => {
      state.status = res.status;
      return await res.json();
    })
    .then(data => {
      state.colleagues = data.users;
      state.selectableColleagues = this.getSelectableColleagues(this.props.members, state.colleagues);
      this.setState(state);
    })
    .catch(err => {
      console.log(err);
    });
  }

  getSelectableColleagues(members, colleagues){
      var participants = [];
      var selectableColleagues = [];

      members.map((member) => (
        participants.push(member.email)
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
      selectableColleagues.push({
        value: auth.getValue("email"),
        label: auth.getValue("fullName"),
        id: auth.getValue("id")
      });

      return _.orderBy(selectableColleagues, ['label'],['asc']);
  }

  render() {
    const {t, members} = this.props;
    const {values, edit, selectableColleagues} = this.state;
    return (
            <>
                {edit === false &&
                <>
                  <CInputGroup className="mb-1 mt-1">
                      <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                      </CInputGroupPrepend>
                      <Select
                          value={values.email}
                          options={selectableColleagues}
                          placeholder="..."
                          onChange={(value) => this.onChange("email", value)}
                          className="col-9 ml-0 pl-0"
                      />
                      <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1" disabled={ (_.isEmpty(values.email) || _.isNull(values.email)) ? true : false}>
                        {t("General.buttons.add")}
                      </CButton>
                  </CInputGroup>
                </>
                }

                {members.length > 0 &&
                   <CCard>
                    <CCardBody>
                            {members.map((item, index) => (
                                  <CRow key={"MemberRow-"+ index} style={{background: "whitesmoke", padding: "5px", marginBottom: "5px"}}>
                                    {edit === index
                                      ?
                                        <>
                                        <CInputGroup className="mb-1 ml-4">
                                            <Select
                                                value={values.email}
                                                options={selectableColleagues}
                                                placeholder="..."
                                                onChange={(value) => this.onChange("email", value)}
                                                className="col-9 ml-0 pl-0"
                                            />
                                            <CButton color="primary" size="sm" onClick={this.addItem} className="ml-3" disabled={ (_.isEmpty(values.email) || _.isNull(values.email)) ? true : false}>
                                            {t("General.buttons.update")}
                                            </CButton>
                                        </CInputGroup>
                                        </>
                                      :
                                        <>
                                          <CCol className="col-1 font-weight-bold">
                                            {index+1}
                                          </CCol>
                                          <CCol className="col-8 font-smaller">
                                            {item.fullName}
                                          </CCol>
                                          <CCol className="col-3 text-right">
                                            {edit === false &&
                                              <>
                                                <CButton color="primary" size="sm" onClick={(event => this.editItem(index))}>
                                                  <CIcon name="cil-pencil"/>
                                                </CButton>
                                                <CButton color="danger" className="ml-1" size="sm" onClick={(event => this.deleteItem(index))}>
                                                  <CIcon name="cil-x"/>
                                                </CButton>
                                              </>
                                            }
                                          </CCol>
                                        </>
                                    }
                                  </CRow>
                            ))}
                    </CCardBody>
                  </CCard>
                }
              </>
          );
    }
}

Members.propTypes = propTypes;
Members.defaultProps = defaultProps;

export default withTranslation()(Members);
