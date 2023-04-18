import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton, CNav, CNavLink, CNavItem,
  CTabs, CTabContent
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';

import { withTranslation } from 'react-i18next';

import Whiteboard from './Whiteboard';
import Ideation from './Ideation';
import Votes from './Votes';
import Tasks from './Tasks';


const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};


class MeetingContent extends Component {

  render() {
    const {leftBar, whiteboard, ideation, votes, project, settings, meeting, user, t} = this.props;

    return (
        <CTabs>
          <CButton className=" float-lg-left" color="primary" onClick={() => this.props.switchLeftBar()} variant="outline" size="sm">
                <CIcon name={leftBar ? "cil-arrow-left" : "cil-arrow-right"} size="sm" />
          </CButton>
          <CNav variant='tabs' className='nav-underline nav-underline-primary nav-justified'>
            <CNavItem>
              <CNavLink>
                {t("Execution.titles.whiteboard")}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                {t("Execution.titles.ideation")}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                {t("Execution.titles.votes")}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                {t("Execution.titles.tasks")}
              </CNavLink>
            </CNavItem>
            {/*<CNavItem>
              <CNavLink>
                {t("Execution.titles.pdf_viewer")}
              </CNavLink>
            </CNavItem>*/}
          </CNav>

          <CTabContent>
            <Whiteboard
              leftBar={leftBar}
              socket={this.props.socket}
              whiteboard={whiteboard}
              user={user}
              meeting={meeting}
              settings={settings}

              notify={this.props.notify}
              syncMeeting={this.props.syncMeeting}
              />

          <Ideation
              leftBar={leftBar}
              socket={this.props.socket}
              ideation={ideation}
              user={user}
              meeting={meeting}
              settings={settings}

              notify={this.props.notify}
              syncMeeting={this.props.syncMeeting}
              />

          <Votes
              leftBar={leftBar}
              socket={this.props.socket}
              votes={votes}
              user={user}
              meeting={meeting}
              settings={settings}
              attendees={this.props.attendees}
              participants={this.props.participants}

              notify={this.props.notify}
              syncMeeting={this.props.syncMeeting}
              />

          <Tasks
              leftBar={leftBar}
              socket={this.props.socket}
              user={user}
              meeting={meeting}
              settings={settings}
              attendees={this.props.attendees}
              participants={this.props.participants}
              project={project}

              notify={this.props.notify}
              syncMeeting={this.props.syncMeeting}
              />

            {/*<CTabPane className="text-center">
              <div style={{ height: window.innerHeight*0.78 }} className="border-primary mt-1 p-1">
                {/*<PDFViewer
                    document={{
                        url: 'http://localhost:9000/docs/de708a32031dce4c5f6f1a09e000d9b637ff41b29668f60d763c503fdbaa192e7d9c3c65.pdf',
                    }}
                  />*
              </div>
                  </CTabPane>*/}

          </CTabContent>
        </CTabs>
    );
  }
}

MeetingContent.propTypes = propTypes;
MeetingContent.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(MeetingContent));
