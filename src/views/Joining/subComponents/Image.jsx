import React, { Component } from 'react';
import {
  CButton,
  CCol,
  CRow,
  CModal,
  CModalBody,
  CModalFooter,
  CSpinner
} from '@coreui/react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ImageUploader from 'react-images-upload';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Image extends Component {
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
    this.props.createImage(this.refs.cropper.getCroppedCanvas().toDataURL());
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
                  onClose={this.props.closeImage}
                  centered={true}
                  fade={true}
                >
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
                      onClick={this.props.closeImage}
                    >{t("General.buttons.cancel")}</CButton>
                  </CModalFooter>
                </CModal>
          );
        case 'cropper':
          return (
            <CModal
                  show={show}
                  onClose={this.props.closeImage}
                  centered={true}
                  fade={true}
                  size="xl"
                >
                  <CModalBody className="text-center">
                    <CRow>
                      <CCol className="col-3"></CCol>
                      <CCol className=" col-6 align-self-center bg-gradient-light">
                        <Cropper
                          ref="cropper"
                          src={tmp_picture}
                          style={{height: 400, width: 600}}
                          guides={false}
                          background={false}
                          checkCrossOrigin={false}
                          checkOrientation={false}
                          //aspectRatio={4 / 3}
                          crop={this._crop} />
                      </CCol>
                      <CCol className="col-3"></CCol>
                    </CRow>
                  </CModalBody>
                  <CModalFooter>
                    {loading
                    ? <CSpinner animation="border" variant="primary" />
                    : <CButton color="primary" type="submit" className="px-4" onClick={this.onSubmit}>{t("General.buttons.submit")}</CButton>
                    }
                    <CButton
                      color="secondary"
                      onClick={this.props.closeImage}
                    >{t("General.buttons.cancel")}</CButton>
                  </CModalFooter>
                </CModal>
          );

          default: return null;
    }
  }
}


Image.propTypes = propTypes;
Image.defaultProps = defaultProps;


export default withTranslation()(Image);
