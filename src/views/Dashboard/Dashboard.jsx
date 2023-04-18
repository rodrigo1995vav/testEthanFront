import React, { Component} from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CCallout
} from '@coreui/react';
import {withTranslation} from 'react-i18next';
import PropTypes from "prop-types";

import {FaCalendarAlt, FaTasks} from 'react-icons/fa';

import renderHTML from 'react-render-html';

var auth = require('./../../services/Auth');

const propTypes = {
  children: PropTypes.node
};

const defaultProps = {};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.getDashboard = this.getDashboard.bind(this);

    this.state = {
      loading: true,
      dashboard: {}
    }
  }

  componentDidMount() {
    this.getDashboard()
  }

  getDashboard = () => {
    var state = this.state;
    fetch(auth.prepareURL(process.env.REACT_APP_API_URL_USERS_DASHBOARD), auth.getRequestInit('get', null))
    .then(async res => {
      this.state.status = res.status;
      return await res.json();
    })
    .then(data => {
      if(this.state.status === 200)
      {
        state.dashboard = data.dashboard;
        state.loading = false;
        this.setState(state);
      }
    })
    .catch(err => {
    });
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    const {t} = this.props;
    const {dashboard, loading} = this.state;


    if(loading)
      return this.loading();

    return (
      <div className="animated fadeIn">

        <CRow>
          <CCol>
          <CCard>
              <CCardHeader>
              <FaCalendarAlt className="mr-3" /> {t("Dashboard.labels.meetings")}
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol xs="12" md="12" xl="12">
                    <CRow>
                      <CCol sm="3">
                        <CCallout color="info">
                          <small className="text-muted">{t("Dashboard.labels.total")}</small>
                          <br />
                          <strong className="h4">{dashboard.meetings.cancelled + dashboard.meetings.completed + dashboard.meetings.new}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="3">
                        <CCallout color="danger">
                          <small className="text-muted">{t("Dashboard.labels.cancelled")}</small>
                          <br />
                          <strong className="h4">{dashboard.meetings.cancelled}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="3">
                        <CCallout color="success">
                          <small className="text-muted">{t("Dashboard.labels.completed")}</small>
                          <br />
                          <strong className="h4">{dashboard.meetings.completed}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="3">
                        <CCallout color="warning">
                          <small className="text-muted">{t("Dashboard.labels.upcoming")}</small>
                          <br />
                          <strong className="h4">{dashboard.meetings.new}</strong>
                        </CCallout>
                      </CCol>
                    </CRow>

                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            <CCard>
              <CCardHeader>
                <FaTasks className="mr-3" />  {renderHTML(t("Dashboard.labels.assigned_tasks"))}
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol xs="12" md="12" xl="12">
                    <CRow>
                      <CCol sm="3">
                        <CCallout color="info">
                          <small className="text-muted">{t("Dashboard.labels.total")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.assigned}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="3">
                        <CCallout color="danger">
                          <small className="text-muted">{t("Task.labels.p5")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.p5}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="3">
                        <CCallout color="warning">
                          <small className="text-muted">{t("Task.labels.p3")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.p3}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="3">
                        <CCallout color="success">
                          <small className="text-muted">{t("Task.labels.p1")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.p1}</strong>
                        </CCallout>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol sm="2">
                      </CCol>
                      <CCol sm="2">
                        <CCallout color="dark">
                          <small className="text-muted">{t("Task.labels.bug")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.bug}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="2">
                        <CCallout color="light">
                          <small className="text-muted">{t("Task.labels.feature")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.feature}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="2">
                        <CCallout color="dark">
                          <small className="text-muted">{t("Task.labels.change")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.change}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="2">
                        <CCallout color="light">
                          <small className="text-muted">{t("Task.labels.task")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.task}</strong>
                        </CCallout>
                      </CCol>
                      <CCol sm="2">
                        <CCallout color="dark">
                          <small className="text-muted">{t("Task.labels.request")}</small>
                          <br />
                          <strong className="h4">{dashboard.tasks.request}</strong>
                        </CCallout>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    );
  }
}

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default withTranslation()(Dashboard);
