import React, { Component } from 'react';
import {
  CButton,
  CCol,
  CRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CSpinner
} from '@coreui/react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ImageUploader from 'react-images-upload';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

var auth = require('./../../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class ProfilePicture extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this._crop = this._crop.bind(this);

    this.state = {
      tmp_picture: '',
      window: 'upload',
      loading: false
   }
  }

  _crop(){
  }

  static getDerivedStateFromProps(props, state) {
    if(!props.show)
    {
      state.window = 'upload';
      state.loading = false;
      state.tmp_picture = '';

      return state;
    }
    return null;
  }

  onDrop = (files) => {
    if(files.length === 1)
    {
      this.setState({
        tmp_picture:  URL.createObjectURL(files[0]),
        window: 'cropper'
      });
    }
  }

  async onSubmit (event) {
    event.preventDefault();

    var state = this.state;
    state.loading = true;
    this.setState(state);

    var formData = new FormData();
    formData.append('picture',this.refs.cropper.getCroppedCanvas().toDataURL());

    var res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_PICTURE),auth.getRequestInitFile('post', formData))
    var status = res.status;
    if(status === 200)
    {
      var data = await res.json();
      auth.setPicture(data.picture);
      this.props.notify('success', 'ProfilePicture.msgs.picture_updated_successfully');
      this.props.updateProfilePicture();
      this.props.closeProfilePicture();
    }
    else
    {
      this.props.notify('danger', 'ProfilePicture.msgs.picture_updated_alert');
      this.props.closeProfilePicture();
    }
  }

  render() {
    const {t, show} = this.props;
    const {loading, window, tmp_picture} = this.state;

    switch(window)
    {
        case 'upload':
          return (
            <CModal
                  show={show}
                  onClose={this.props.closeProfilePicture}
                  centered={true}
                  fade={true}
                >
                  <CModalHeader closeButton>{t("ProfilePicture.titles.change_picture")}</CModalHeader>
                  <CModalBody className="text-center">
                    <CRow>
                        <CCol md="2"></CCol>
                        <CCol  xs="12" md="8" className="text-center bg-gradient-light">
                                <ImageUploader
                                     withIcon={true}
                                     buttonText={t('ProfilePicture.labels.choose_image')}
                                     onChange={this.onDrop}
                                     imgExtension={['.jpg', '.gif', '.png', '.jpeg']}
                                     label={t('ProfilePicture.labels.image_restrictions',{var: process.env.REACT_APP_AVATAR_MAX_SIZE})}
                                     maxFileSize={process.env.REACT_APP_AVATAR_MAX_SIZE *1024*1024}
                                     singleImage={true}
                                    />
                          </CCol>
                    </CRow>
                  </CModalBody>
                  <CModalFooter>
                    <CButton
                      color="secondary"
                      onClick={this.props.closeProfilePicture}
                    >{t("General.buttons.cancel")}</CButton>
                  </CModalFooter>
                </CModal>
          );
        case 'cropper':
          return (
            <CModal
                  show={show}
                  onClose={this.props.closeProfilePicture}
                  centered={true}
                  fade={true}
                >
                  <CModalHeader closeButton>{t("ProfilePicture.titles.change_picture")}</CModalHeader>
                  <CModalBody className="text-center">
                    <CRow>
                      <CCol md="2"></CCol>
                      <CCol  xs="12" md="8" className="text-center bg-gradient-light">
                        <Cropper
                          ref="cropper"
                          src={tmp_picture}
                          style={{height: 300, width: 300}}
                          guides={false}
                          background={false}
                          checkCrossOrigin={false}
                          checkOrientation={false}
                          aspectRatio={4 / 4}
                          crop={this._crop} />
                      </CCol>
                    </CRow>
                  </CModalBody>
                  <CModalFooter>
                    {loading
                    ? <CSpinner animation="border" variant="primary" />
                    : <CButton color="primary" type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                    }
                    <CButton
                      color="secondary"
                      onClick={this.props.closeProfilePicture}
                    >{t("General.buttons.cancel")}</CButton>
                  </CModalFooter>
                </CModal>
          );

          default: return null;
    }
  }
}

ProfilePicture.propTypes = propTypes;
ProfilePicture.defaultProps = defaultProps;


export default withTranslation()(ProfilePicture);
