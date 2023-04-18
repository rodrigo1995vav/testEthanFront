import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CTabPane,
  CRow,
  CBadge,
  CTooltip
} from '@coreui/react';
import { withTranslation } from 'react-i18next';

import {FaPlus, FaEdit} from 'react-icons/fa';
import {MdCancel, MdLaunch, MdStop, MdShowChart, MdClose} from 'react-icons/md';
import {GiVote} from 'react-icons/gi';

import { Bar } from 'react-chartjs-2';

import VotesModal from './VotesModal';
import VoteItem from './VoteItem';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const options = {
  tooltips: {
    enabled: true
  },
  maintainAspectRatio: false
}

class Votes extends Component {
  constructor(props){
    super(props);

    this.info = this.info.bind(this);
    this.infoSubmit = this.infoSubmit.bind(this);
    this.status = this.status.bind(this);
    this.infoDelete = this.infoDelete.bind(this);
    this.closeInfo = this.closeInfo.bind(this);
    this.getStatusBadge = this.getStatusBadge.bind(this);
    this.vote = this.vote.bind(this);
    this.closeVote = this.closeVote.bind(this);
    this.showResults = this.showResults.bind(this);
    this.closeResults = this.closeResults.bind(this);
    this.syncVotes = this.syncVotes.bind(this);
    this.confirmation = this.confirmation.bind(this);

    this.state = {
      modal: {
        show: false,
        action: null,
        vote: null,
        key: null
      },
      voteItem: {
        show: false,
        vote: null,
        key: null
      },
      voteResults: {
        show: false,
        vote: null,
        key: null
      },
      chart: {},
      labels: [],
      data: []
    }
  }

  info = (action, vote, key) => {
    var state = this.state;
    state.modal = {
      show: true,
      vote: vote,
      action: action,
      key: key
    };
    this.setState(state);
  }

  infoSubmit = (values) => {
    var state = this.state;
    var {votes} = this.props;

    if(state.modal.action === 'add'){
      values['status'] = "created";
      values['participants'] = [];
      values['results'] = [];
      votes.push(values);
    }
    else{
      values['status'] =  votes[state.modal.key]['status'];
      values['participants'] = votes[state.modal.key]['participants'];
      values['results'] = votes[state.modal.key]['results'];

      votes[state.modal.key] = values;
    }

    this.syncVotes(votes);

    state.modal = {
      show: false,
      vote: null,
      action: null,
      ley: null
    }
    this.setState(state);
  }

  status = (status, vote, key) => {
    var {votes} = this.props;

    votes[key].status = status;

    if(status === 'in_progress'){
      switch(vote.type)
      {
        case "yes_no": votes[key].results = {"yes": 0, "no": 0}; break;
        case "percentage": votes[key].results = {"20%": 0, "40%": 0, "60%": 0, "80%": 0, "100%": 0}; break;
        case "levels": votes[key].results = {"very_low": 0, "low": 0, "moderate": 0, "high": 0, "very_high": 0}; break;
        default:
          votes[key].results = {};
          for(var i=0; i < vote.number; i++){
            votes[key].results[vote.options[i]] = 0;
          }
      }
      votes[key].participants = [];
      votes[key].startDate = Date.now();
    }
    if(status === 'completed'){
      votes[key].online = this.props.participants.length;
      votes[key].endDate = Date.now();
    }
    this.syncVotes(votes);
  }

  infoDelete = (vote) => {
    var state = this.state;
    var {votes} = this.props;

    votes.splice(state.modal.key, 1);
    this.syncVotes(votes);
    state.modal = {
      show: false,
      vote: null,
      action: null
    }
    this.setState(state);
  }

  closeInfo = () => {
    var state = this.state;
    state.modal = {
      show: false,
      vote: null,
      action: null
    }
    this.setState(state);
  }

  getStatusBadge = (status) => {
    switch(status){
      case "created":
        return "light";
      case "in_progress":
        return "warning";
      case "completed":
        return "success"
      default: return "";
    }
  }

  vote = (vote, key) => {
    var state = this.state;
    state.voteItem = {
      show: true,
      vote: vote,
      key: key
    }
    this.setState(state);
  }

  voteSubmit = (value) => {
    var state = this.state;

    this.props.socket.emit('voteSubmit', {key: state.voteItem.key, vote: state.voteItem.vote, value: value}, (res) => this.confirmation(res));

    state.voteItem = {
      show: false,
      vote: null,
      key: null
    }
    this.setState(state);
  }

  closeVote = () => {
    var state = this.state;
    state.voteItem = {
      show: false,
      vote: null,
      key: null
    }
    this.setState(state);
  }

  showResults = (vote, key) => {
    var state = this.state;
    state.voteResults = {
      show: true,
      vote: vote,
      key: key
    }
    var options = [];
    var results = [];
    switch(vote.type){
      case 'yes_no':
        options.push(this.props.t("General.labels.yes"));
        options.push(this.props.t("General.labels.no"));
        results = [vote.results['yes'], vote.results['no']];
        break;
      case 'percentage':
        for(var i = 20; i <=100; i+=20){
          options.push(i+"%");
          results.push(vote.results[i+"%"]);
        }
        break;
      case 'levels':
        ['very_low', 'low', 'moderate', 'high', 'very_high'].map((v, k) => {
          options.push(v);
          results.push(vote.results[v]);
          return true;
        });
        break;
      default:
        for(var j=0; j < vote.number; j++){
          options.push(vote.options[j]);
          results.push(vote.results[vote.options[j]]);
        }
    }
    state.chart  = {
        labels: options,
        datasets: [
          {
            label: vote.title,
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: results,
          },
        ],
      };
    state.labels = options;
    state.data = results;

    this.setState(state);
  }

  closeResults = () => {
    var state = this.state;
    state.voteResults = {
      show: false,
      vote: null,
      key: null
    }
    this.setState(state);
  }

  syncVotes = (items) => {
    if(this.props.user.email === this.props.settings.votes)
    {
      this.props.socket.emit('votes', items, (res) => this.confirmation(res));
    }
  }

  confirmation = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.sync_not_sent");
    }
  }

  render() {
    const {t, user, settings, votes, participants} = this.props;
    const {voteResults, chart} = this.state;

    return (
            <CTabPane>
              <CRow className="pt-1 mb-1">
                <CCol className="col-6">
                {user.email === settings.votes &&
                  <CButton color="primary" onClick={() => this.info('add', null, null)} variant="outline" className="ml-1" size="sm"><FaPlus /></CButton>
                }
                </CCol>

                <CCol className="col-6 text-right">
                </CCol>

              </CRow>
              <div style={{ height: voteResults.show ? window.innerHeight*0.4 : window.innerHeight*0.73 }} className={user.email === settings.votes ? "border-primary mt-1 p-1 overflow-auto" : "border-primary mt-4 p-1 overflow-auto"}>
                <CRow className='col-12 p-1 border-bottom  text-center'>
                    <CCol className='col-1 font-weight-bold'>{t("Votes.titles.id")}</CCol>
                    <CCol className='col-3 font-weight-bold'>{t("Votes.titles.title")}</CCol>
                    <CCol className='col-2 font-weight-bold'>{t("Votes.titles.type")}</CCol>
                    <CCol className='col-2 font-weight-bold'>{t("Votes.titles.status")}</CCol>
                    <CCol className='col-2 font-weight-bold'>{t("Votes.titles.votes")}</CCol>
                    <CCol className='col-2'></CCol>
                </CRow>
                {votes.map((vote, key) => (
                  <CRow className='col-12 pt-1 pb-1 text-center  border-bottom' key={'vote-'+key}>
                    <CCol className='col-1 text-left'>{key+1}.</CCol>
                    <CCol className='col-3 text-left'>{vote.title}</CCol>
                    <CCol className='col-2'>
                        {t("Votes.labels.type_" + vote.type)}
                    </CCol>
                    <CCol className='col-2'>
                      <CBadge color={this.getStatusBadge(vote.status)}>
                        {t("Votes.labels.status_" + vote.status)}
                      </CBadge>
                    </CCol>
                    <CCol className='col-2'>
                      {vote.status !== 'created' &&
                      <>
                      {vote.participants.length + "/" + (vote.status === 'completed' ? vote.online : participants.length) }
                      </>
                      }
                    </CCol>
                    <CCol className='col-2'>
                    {user.email === settings.votes && vote.status === 'created' &&
                      <>
                        <CTooltip content={t("Votes.labels.edit")}>
                          <CButton color="primary" onClick={() => this.info('edit', vote, key)} variant="outline" className="ml-1" size="sm"><FaEdit /></CButton>
                        </CTooltip>
                        <CTooltip content={t("Votes.labels.launch")}>
                          <CButton color="success" onClick={() => this.status('in_progress', vote, key)} variant="outline" className="ml-1" size="sm"><MdLaunch /></CButton>
                        </CTooltip>
                      </>
                    }

                    {vote.status === 'in_progress' && vote.participants.indexOf(user.email) < 0 &&
                      <CTooltip content={t("Votes.labels.vote")}>
                        <CButton color="primary" onClick={() => this.vote(vote, key)} variant="outline" className="ml-1" size="sm">
                          <GiVote />
                        </CButton>
                      </CTooltip>
                    }

                    {user.email === settings.votes && vote.status === 'in_progress' &&
                      <>
                        <CTooltip content={t("Votes.labels.cancel")}>
                          <CButton color="warning" onClick={() => this.status('created', vote, key)} variant="outline" className="ml-1" size="sm">
                            <MdCancel />
                          </CButton>
                        </CTooltip>
                        <CTooltip content={t("Votes.labels.end")}>
                          <CButton color="info" onClick={() => this.status('completed', vote, key)} variant="outline" className="ml-1" size="sm">
                            <MdStop />
                          </CButton>
                        </CTooltip>
                      </>
                    }

                    {vote.status === 'completed' && voteResults.key !==  key &&
                      <>
                        {user.email === settings.votes &&
                          <CTooltip content={t("Votes.labels.cancel")}>
                            <CButton color="warning" onClick={() => this.status('created', vote, key)} variant="outline" className="ml-1" size="sm">
                              <MdCancel />
                            </CButton>
                          </CTooltip>
                        }
                        <CTooltip content={t("Votes.labels.results")}>
                          <CButton color="info" onClick={() => this.showResults(vote, key)} variant="outline" className="ml-1" size="sm">
                            <MdShowChart />
                          </CButton>
                        </CTooltip>
                      </>
                    }
                    </CCol>
                  </CRow>
                ))
                }
              </div>

              {voteResults.show &&
                <div style={{ height: window.innerHeight*0.33 }} className="mt-1 p-1 fade-in">
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td width="50%" className="p-2">
                          <div style={{height: window.innerHeight*0.30}}>
                            <Bar data={chart} options={options} />
                          </div>
                        </td>
                        <td width="50%">
                          <table width="95%" className="ml-2">
                            <thead>
                              <tr>
                                <td colSpan="2" className="p-2">
                                  <b>{voteResults.vote.description}</b>
                                  <CButton color="primary" onClick={() => this.closeResults()} className=" float-xl-right" size="sm">
                                    <MdClose />
                                  </CButton>
                                </td>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.labels.map((v, k) => (
                                <tr key={'line-'+k} className="border-light">
                                  <td>
                                      <b>{v}</b>
                                  </td>
                                  <td>
                                      {this.state.data[k]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              }

              <VotesModal
                modal={this.state.modal}
                infoSubmit = {this.infoSubmit}
                infoDelete = {this.infoDelete}
                closeInfo = {this.closeInfo}
                />

              <VoteItem
                modal={this.state.voteItem}
                voteSubmit = {this.voteSubmit}
                closeVote = {this.closeVote}
                />

            </CTabPane>
    );
  }
}

Votes.propTypes = propTypes;
Votes.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Votes));
