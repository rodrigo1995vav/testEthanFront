import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  CContainer,
  CToast,
  CToaster,
  CToastHeader,
  CToastBody
} from '@coreui/react';

import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import Summary from './components/Summary';
import Execution from './components/Execution';

var auth = require("./../../services/Auth");

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Joining extends Component {
  constructor(props) {
    super(props);
    this.notify = this.notify.bind(this);
    this.setMeeting = this.setMeeting.bind(this);
    this.setAction = this.setAction.bind(this);

    this.state = {
      action : "loading",
      user: null,
      meeting : null,
      toasts: []
    };
  }

  async componentDidMount(){
    var state = this.state;

    var r = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_MEETINGS_VALIDATE) + this.props.match.params.code, auth.getRequestInit('get',null));

    if(r.status === 200)
    {
        r = await r.json();
        state.meeting = r.meeting;
        var picture = auth.getPicture();

        state.user = {
          picture : picture === "undefined" || picture.length === 0 ? false : (process.env.REACT_APP_AVATAR_URL + picture),
          email : auth.getValue("email"),
          fullName : auth.getValue("fullName"),
          initials : auth.getValue("initials"),
          timezone : auth.getTimezone()
        }
        state.action = "summary";
    }
    else
    {
      state.action = "redirect";
    }

    this.setState(state);
  }

  notify = (type, msg, params={}) => {
    var state = this.state;
    state.toasts.push(
      { position: 'bottom-right',
        autohide: 4000,
        type: 'alert-' + type,
        title: 'General.labels.notification',
        body: msg,
        params: params
      }
    );
    this.setState(state);
  }

  setMeeting = (meeting) => {
    var state = this.state;
    state.meeting = meeting;
    this.setState(state);
  }

  setAction = (status) => {
    var state = this.state;
    state.action = status;
    this.setState(state);
  }

  render() {
      const { action, meeting, user, toasts} = this.state;
      const {t} = this.props;

      let toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
      })();

      if(action === "redirect")
      {
        return <Redirect to={"/login/" + this.props.match.params.code} /> ;
      }

      if(action === "loading")
      {
        return <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
      }

      if(action === "disconnected")
      {
        return <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div><h3>{t("Joining.labels.disconnected")}</h3></div>;
      }

      return (
            <div className="c-app c-default-layout align-items-center vw-100 vh-100">
                {action === "summary" &&
                  <CContainer>
                    <Summary
                      meeting={meeting}
                      user={user}

                      setMeeting={this.setMeeting}
                      setAction={this.setAction}
                      notify={this.notify}
                    />
                  </CContainer>
                }

                {action === "execution" &&
                  <Execution
                    meeting={meeting}
                    user={user}

                    setMeeting={this.setMeeting}
                    setAction={this.setAction}
                    notify={this.notify}
                  />
                }

              {Object.keys(toasters).map((toasterKey) => (
                <CToaster position={toasterKey} key={'toaster' + toasterKey}>
                {
                    toasters[toasterKey].map((toast, key)=>{
                      return(
                                <CToast
                                  key={'toast' + key}
                                  show={true}
                                  autohide={toast.autohide}
                                  fade={toast.fade}
                                  className={toast.type}
                                >
                                  <CToastHeader closeButton={toast.closeButton}>{t(toast.title)}</CToastHeader>
                                  <CToastBody>{t(toast.body, toast.params)}</CToastBody>
                                </CToast>
                      )
                    })
                }
                </CToaster>
              ))}
            </div>
      );
  }
}

Joining.propTypes = propTypes;
Joining.defaultProps = defaultProps;

export default withTranslation()(Joining);
