import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CTabPane,
  CRow,
  CBadge
} from '@coreui/react';

import _ from 'lodash';

import { withTranslation } from 'react-i18next';

import {FaArrowRight,
        FaInfo,
        FaFolderOpen,
        FaSave,
        FaFlag
        } from 'react-icons/fa';
import {GrNew} from 'react-icons/gr';
import {BsArrowsCollapse, BsArrowsExpand} from 'react-icons/bs';


import 'react-sortable-tree/style.css';
import SortableTree, {getNodeAtPath, removeNodeAtPath, changeNodeAtPath, addNodeUnderParent, toggleExpandedForAll} from 'react-sortable-tree';

import IdeationModal from './IdeationModal';
import IdeationSave from './IdeationSave';
import IdeationOpen from './IdeationOpen';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Ideation extends Component {
  constructor(props){
    super(props);

    this.info = this.info.bind(this);
    this.onChange = this.onChange.bind(this);
    this.closeInfo = this.closeInfo.bind(this);
    this.nodeSubmit = this.nodeSubmit.bind(this);
    this.nodeDelete = this.nodeDelete.bind(this);

    this.save = this.save.bind(this);
    this.closeSave = this.closeSave.bind(this);

    this.open = this.open.bind(this);
    this.closeIdeationOpen = this.closeIdeationOpen.bind(this);
    this.loadItems = this.loadItems.bind(this);

    this.syncIdeation = this.syncIdeation.bind(this);
    this.confirmation = this.confirmation.bind(this);
    this.expand = this.expand.bind(this);

    this.state = {
      modal: {
        show: false,
        node: null,
        treeIndex: null,
        path: null,
        action: null
      },
      save: {
        show: false,
        items: []
      },
      open: {
        show: false,
        ref: null
      }
    };
  }

  onChange = (treeData) => {
    this.props.syncMeeting({ideation: treeData});
    if(this.props.user.email === this.props.settings.ideation)
    {
        this.syncIdeation(treeData);
    }
  }

  info = (action, rawInfo) => {
    var state = this.state;
    if(_.isNull(rawInfo))
    {
      state.modal = {
        show: true,
        node: null,
        treeIndex: null,
        path: null,
        action: action
      }
    }
    else
    {
      const {node, treeIndex, path} = rawInfo;
      state.modal = {
        show: true,
        node: node,
        treeIndex: treeIndex,
        path: path,
        action: action
      }
    }
    this.setState(state);
  }

  nodeSubmit = (values) => {
    var state = this.state;
    var {ideation} = this.props;

    var newNode = {
      title: values.title,
      subtitle: values.subtitle,
      flagged: values.flagged,
      children: []
    };

    if(state.modal.action === 'edit'){
      newNode.children = state.modal.node.children;

      let treeData = changeNodeAtPath({
        treeData: ideation,
        path: state.modal.path,
        newNode: newNode,
        getNodeKey: ({node, treeIndex}) => {
          return treeIndex;
        },
        ignoreCollapsed: true
      });
      ideation = treeData;
    }
    else
    {
        var parentNode = null;
        var parentKey = null;

        if(_.isArray(state.modal.path)){
          parentNode = getNodeAtPath({
            treeData: ideation,
            path : state.modal.path,
            getNodeKey: ({ treeIndex }) =>  treeIndex,
            ignoreCollapsed : true
          });
          let getNodeKey = ({ node: object, treeIndex: number }) => {
            return number;
          };
          parentKey = getNodeKey(parentNode);
          if(parentKey === -1) {
              parentKey = null;
          }
        }

        let treeData = addNodeUnderParent({
          treeData: ideation,
          newNode: newNode,
          expandParent: true,
          parentKey: parentKey,
          getNodeKey: ({node,treeIndex}) => {
            return treeIndex;
          },
          addAsFirstChild: false
        });
        ideation = treeData.treeData;
    }

    this.syncIdeation(ideation);

    state.modal = {
      show: false,
      node: null,
      treeIndex: null,
      path: null,
      action: null
    }
    this.setState(state);
  }

  nodeDelete = (node, path) => {
    var state = this.state;
    var {ideation} = this.props;

    ideation =  removeNodeAtPath({
        treeData: ideation,
        path: state.modal.path,
        getNodeKey: ({node, treeIndex}) => {
          return treeIndex;
        },
        ignoreCollapsed: true
    });

    this.syncIdeation(ideation);

    state.modal = {
      show: false,
      node: null,
      treeIndex: null,
      path: null,
      action: null
    }
    this.setState(state);
  }

  closeInfo = () => {
    var state = this.state;
    state.modal = {
      show: false,
      node: null,
      path: null,
      action: null
    }
    this.setState(state);
  }

  save = () => {
    var state = this.state;
    var {ideation} = this.props;
    state.save = {
      show: true,
      items: ideation
    }
    this.setState(state);
  }

  closeSave = () => {
    var state = this.state;
    state.save = {
      show: false,
      items: []
    }
    this.setState(state);
  }

  open = () => {
    var state = this.state;
    state.open = {
      show: true
    }
    this.setState(state);
  }

  closeIdeationOpen = () => {
    var state = this.state;
    state.open = {
      show: false
    }
    this.setState(state);
  }

  loadItems = (items, ref) => {
    var state = this.state;
    this.syncIdeation(items);
    state.open.ref = ref;
    this.setState(state);
  }

  syncIdeation = (items) => {
    if(this.props.user.email === this.props.settings.ideation)
    {
      this.props.socket.emit('ideation', items, (res) => this.confirmation(res));
    }
  }

  confirmation = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.sync_not_sent");
    }
  }

  expand = (status) => {
    var {ideation} = this.props;
    ideation = toggleExpandedForAll({treeData: ideation, expanded: status});
    this.props.syncMeeting({'ideation': ideation});
  }

  render() {
    const {user, settings, ideation} = this.props;
    const { modal} = this.state;

    return (
            <CTabPane>
              <CRow className="pt-1 mb-1">
                <CCol className="col-6">
                  {user.email === settings.ideation &&
                  <>
                    <CButton color="primary" onClick={() => this.info('add', null)} variant="outline" className="ml-1" size="sm"><GrNew /></CButton>
                  </>
                  }
                  <CButton color="primary" disabled={ideation.length === 0 ? true: false} onClick={() => this.expand(false)} variant="outline" className="ml-1" size="sm"><BsArrowsCollapse /></CButton>
                  <CButton color="primary" disabled={ideation.length === 0 ? true: false} onClick={() => this.expand(true)} variant="outline" className="ml-1" size="sm"><BsArrowsExpand /></CButton>
                </CCol>

                <CCol className="col-6 text-right">
                  {user.email === settings.ideation &&
                  <>
                    <CButton color="primary" variant="outline" onClick={this.open} className="ml-1" size="sm"><FaFolderOpen /></CButton>
                  </>
                  }
                  <CButton color="primary" variant="outline" disabled={ideation.length === 0 ? true : false} onClick={this.save} className="ml-1" size="sm"><FaSave /></CButton>
                </CCol>

              </CRow>
              <div style={{ height: window.innerHeight*0.73 }} className="border-primary mt-1 p-1">
                <SortableTree
                  treeData={ideation}
                  onChange={treeData => this.onChange(treeData)}
                  maxDepth={_.toInteger(process.env.REACT_APP_IDEATION_MAX_DEPTH)}
                  canDrag={user.email === settings.ideation ? true : false}
                  generateNodeProps={(rawInfo) => ({
                    title: (
                        <CRow className="col-12">
                          <CCol className="col-8 text-capitalize font-sm">
                            {rawInfo.node.title}
                            {rawInfo.node.flagged &&
                              <CBadge color="warning ml-1"><FaFlag/></CBadge>
                            }
                          </CCol>
                          {user.email === settings.ideation  &&
                            <CCol className="col-4 text-right">
                              <CButton color="primary" onClick={() => this.info('edit', rawInfo)} className="mr-1" variant="outline" size="sm"><FaInfo /></CButton>
                              {rawInfo.path.length < _.toInteger(process.env.REACT_APP_IDEATION_MAX_DEPTH) &&
                                <CButton color="primary" onClick={() => this.info('add', rawInfo)} variant="outline" size="sm"><FaArrowRight /></CButton>
                              }
                            </CCol>
                          }
                        </CRow>
                    ),
                    subtitle: (
                      <span className="font-smaller">
                          {rawInfo.node.subtitle.substr(0, 30)}
                          {rawInfo.node.subtitle.length > 30 &&
                            <>...</>
                          }
                      </span>
                  ),
                })}
                />
              </div>

              <IdeationModal
                modal={modal}
                nodeSubmit = {this.nodeSubmit}
                nodeDelete = {this.nodeDelete}
                closeInfo = {this.closeInfo}
                />

              <IdeationSave
                modal={this.state.save}
                open={this.state.open}
                closeSave = {this.closeSave}
                notify = {this.props.notify}
                />

              <IdeationOpen
                modal={this.state.open}
                closeIdeationOpen = {this.closeIdeationOpen}
                loadItems = {this.loadItems}
                notify = {this.props.notify}
                />

            </CTabPane>
    );
  }
}

Ideation.propTypes = propTypes;
Ideation.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Ideation));
