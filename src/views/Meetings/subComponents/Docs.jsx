import React, { Component } from 'react';

import {
  CBadge,
  CButton,
  CCol,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CDropdown,CDropdownMenu,CDropdownItem,CDropdownToggle,
  CAlert
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import _ from 'lodash';
var auth = require('./../../../services/Auth');


const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Docs extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.cancel = this.cancel.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.switchWindow = this.switchWindow.bind(this);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);

    this.state = {
      values: {
        url: "https://",
        name: "",
        type: "",
      },
      errors: [],
      edit: false,
      window: "list"
    }

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
    this.allowedExtensions = ['.txt', '.csv', '.pdf', '.doc', '.docx', '.xls' , '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp','.jpeg', '.jpg', '.gif', '.png'];
    this.inputRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.initializeComponents)
    {
      var state = this.state;
      state.values = {
        url: "https://",
        name: "",
        type: ""
      };
      state.errors = [];
      state.edit = false;
      state.window = "list";
      this.props.componentsInitialized();
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    state.errors[name] = false;
    this.setState(state);
  }

  cancel = (event) => {
    var state = this.state;
    state.window = "list";
    state.errors = [];
    state.edit = false;
    state.values = {
      url: "https://",
      name: "",
      type: ""
    };

    this.setState(state);
  }

  switchWindow = (window) => {
    var state = this.state;
    state.window = window;
    state.edit = false;
    state.values.type = window === "from_url" ? "link" : "";
    this.setState(state);
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
            state.values.url = res.file;
            state.values.name = file.name;
            state.values.type = file.type;
            state.window = "from_file_add";
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
      state.values.url = null;
      state.errors.file = this.allowedTypes.indexOf(state.values.url.type) >= 0 ? "Docs.errors.file_too_large" : "Docs.errors.file_type";
    }
    this.setState(state);
  }

  addItem = () => {
    var state = this.state;
    var items = this.props.docs;
    state.errors = {
      name: false,
      url: false
    }

    if(state.values.name.length === 0 )
    {
      state.errors.name = true;
    }
    if(state.values.type === "link" && !_.isArray(state.values.url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g)) )
    {
        state.errors.url = true;
    }

    if(state.errors.name === false && state.errors.url === false)
    {
      if(state.edit !== false)
      {
        items[state.edit].name = state.values.name;
        items[state.edit].url = state.values.url;
      }
      else
      {
        items.push({
          name: state.values.name,
          type: state.values.type,
          url: state.values.url
        });
      }
      this.props.setDocs(items);

      state.values = {
        name: "",
        type: "",
        url: "https://"
      }
      state.edit = false;
      state.errors = [];
      state.window = "list";
    }

    this.setState(state);
  }

  editItem = (index) => {
    var state = this.state;
    state.edit = index;
    state.values = {
      name: this.props.docs[index].name,
      url: this.props.docs[index].url,
      type: this.props.docs[index].type
    }
    this.setState(state);
  }

  deleteItem = (index) => {
    var items = this.props.docs;
    items.splice(index,1);
    this.props.setDocs(items);
  }

  render() {
    const {t, docs} = this.props;
    const {values, errors, edit, window, loading} = this.state;

    switch(window)
    {
      case "from_url":
        return (
              <>
              <hr/>
                <CRow>
                  <CCol className="text-center col-12">
                      <CInputGroup className="mb-2 ml-4">
                                          <CInput
                                              type="text"
                                              name="name"
                                              placeholder={t("Docs.labels.filename")}
                                              value={values.name}
                                              autoComplete="off"
                                              onChange={this.handleInputChange}
                                              maxLength="100"
                                              size="sm"
                                              className={errors.name ? "is-invalid" : ""}
                                          />
                                          <CInput
                                                type="text"
                                                name="url"
                                                placeholder={t("Docs.labels.add_link")}
                                                value={values.url}
                                                autoComplete="off"
                                                onChange={this.handleInputChange}
                                                maxLength="200"
                                                size="sm"
                                                className={errors.url ? "is-invalid" : ""}
                                          />

                        </CInputGroup>
                        <CButton color="primary" size="sm" onClick={this.addItem} className="mr-1">{t("General.buttons.add")}</CButton>
                        <CButton onClick={this.cancel} color="primary" variant="outline" size="sm">{t("General.buttons.cancel")}</CButton>
                    </CCol>
                  </CRow>
          </>
        );

      case "from_file":
        return (
          <>
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
                        <p className=" text-dark">{t("Docs.labels.file_too_large",{var: process.env.REACT_APP_FILE_MAX_SIZE})} <br/>{t("Docs.labels.file_type",{var: this.allowedExtensions.join(', ')})}</p>
                        <button type="button" onClick={() => {this.inputRef.current.click()}} className="chooseFileButton">{t("Docs.labels.upload_file")}</button>
                        <input ref={this.inputRef} onChange={this.uploadFile} type="file" accept={this.allowedExtensions.join() + "," + this.allowedTypes.join()} />
                    </div>
                    <CButton onClick={this.cancel} color="dark" variant="outline" size="sm">{t("General.buttons.cancel")}</CButton>
                  </div>
                  }
                </div>
              </CCol>
            </CRow>
          </>
        );
        case "from_file_add":
          return (
            <><hr/>
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
                        value={values.name}
                        autoComplete="off"
                        onChange={this.handleInputChange}
                        maxLength="100"
                        className={errors.name ? "is-invalid" : ""}
                     />
                      <CButton color="primary" size="sm" onClick={this.addItem} className="ml-1">
                      {t("General.buttons.add")}
                      </CButton>
                  </CInputGroup>
                </CCol>
              </CRow>
            </>
          );

      default:
        return (
                  <>
                    <hr/>
                    {edit === false &&
                      <>
                      <CRow className="m-2">
                        <CCol className="text-right">
                          <CDropdown className="m-1 btn-group">
                              <CDropdownToggle color="dark" variant="outline">
                                {t("Docs.buttons.add_doc")}
                              </CDropdownToggle>
                              <CDropdownMenu placement="bottom">
                                  <CDropdownItem onClick={()=>{this.switchWindow("from_url")}}>{t("Docs.buttons.from_url")}</CDropdownItem>
                                  <CDropdownItem onClick={()=>{this.switchWindow("from_file")}}>{t("Docs.buttons.from_file")}</CDropdownItem>
                              </CDropdownMenu>
                          </CDropdown>
                        </CCol>
                      </CRow>
                      </>
                    }
                    {docs.map((item, index) => (
                        <CRow key={"DocsRow-"+ index} style={{background: "whitesmoke", padding: "5px", marginBottom: "5px"}}>
                                    {edit === index
                                      ?<>
                                        <CCol className="col-12 text-center">
                                          <CInputGroup className="mb-2">
                                            <CInput
                                                type="text"
                                                name="name"
                                                placeholder={t("Docs.labels.edit_item")}
                                                value={values.name}
                                                autoComplete="off"
                                                onChange={this.handleInputChange}
                                                maxLength="100"
                                                size="sm"
                                                className={errors.name ? "is-invalid" : ""}
                                            />
                                            {item.type === "link" &&
                                            <CInput
                                                  type="text"
                                                  name="url"
                                                  placeholder={t("Docs.labels.edit_link")}
                                                  value={values.url}
                                                  autoComplete="off"
                                                  onChange={this.handleInputChange}
                                                  maxLength="200"
                                                  size="sm"
                                                  className={errors.url ? "is-invalid" : ""}
                                              />
                                            }
                                          </CInputGroup>
                                          <CButton color="primary" size="sm" onClick={this.addItem} className="mr-1">{t("General.buttons.update")}</CButton>
                                          <CButton onClick={this.cancel} color="primary" variant="outline" size="sm">{t("General.buttons.cancel")}</CButton>
                                          </CCol>
                                        </>
                                      :
                                        <>
                                          <CCol className="col-1 font-weight-bold">
                                            {index+1}
                                          </CCol>
                                          <CCol className="col-2">
                                            <CBadge color={item.type === "link" ? "info" : "dark"} className="ml-1" size="sm">{t("Meetings.labels." + (item.type === "link" ? "link" : "file"))}</CBadge>
                                          </CCol>
                                          <CCol className="col-6">
                                            <a href={item.type === "link" ? item.url : process.env.REACT_APP_API_URL + (_.isUndefined(item.created) ? "/tmp/" : "/docs/") + item.url} target="_blank" rel='noreferrer noopener'>
                                            {item.name}
                                            </a>
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
                  </>
                );
    }
  }
}

Docs.propTypes = propTypes;
Docs.defaultProps = defaultProps;

export default withTranslation()(Docs);
