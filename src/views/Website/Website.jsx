import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

import {CCol, CRow, CNav} from "@coreui/react";

import renderHTML from "react-render-html";

import {AiOutlineLogin} from "react-icons/ai";
import {FcCollaboration, FcCalendar, FcShare, FcDocument, FcTodoList, FcSurvey} from "react-icons/fc";
import {MdAccountCircle} from "react-icons/md";

import { Link } from "react-scroll";

import _ from "lodash";
import { isEmail } from "validator";

import {CCarousel,
  CCarouselControl,
  CCarouselIndicators,
  CCarouselInner,
  CCarouselItem} from "@coreui/react";

import './../../assets/css/animate.css';
import './../../assets/css/icomoon.css';
import './../../assets/css/bootstrap.css';
import './../../assets/css/style.css';

import Language from './../Components/Language';

var auth = require('./../../services/Auth');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Website extends Component {

  constructor(props){
    super(props);
    this.change = this.change.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getDisabled = this.getDisabled.bind(this);

    this.state = {
      name: "",
      email: "",
      message: "",
      sent: false,
      navbar: false
    }
  }

  change = (e) => {
    const {name, value} = e.target;
    var state = this.state;
    state[name] = value;
    this.setState(state);
  }

  getDisabled = () => {
    var state = this.state;

    var res = false;

    if(_.isEmpty(state.name) || _.isEmpty(state.message)){
      res = true;
    }

    if(!isEmail(state.email)){
      res = true;
    }

    return res;
  }


  sendMessage = async (e) => {
    e.preventDefault();
    var state = this.state;
    await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_SEND_MESSAGE), auth.getRequestInit('post', state))
    state.sent = true;
    this.setState(state);
  }

  updateNavbar = (e) => {
    e.preventDefault();
    var state = this.state;
    state.navbar = !state.navbar;
    this.setState(state);
  }

  render() {
    const {t} = this.props;
    const {name, email, message, sent, navbar} = this.state;

    return (
      <>
            <header role="banner" id="fh5co-header">
              <CRow className="col-12">
                  <CNav className="navbar navbar-default navbar-fixed-top bg-gradient-light">
                    <CCol className="navbar-header col-sm-3 col-lg-3">
                        <a href="/" className={navbar ? "js-fh5co-nav-toggle fh5co-nav-toggle active" : "js-fh5co-nav-toggle fh5co-nav-toggle"} data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar" onClick={(e) => this.updateNavbar(e)}><i></i></a>
                        <img src="/assets/img/logo/logo_large_transparent.png" alt="logo2" width="200px" />
                    </CCol>
                    <CCol id="navbar" className={navbar ? "navbar-collapse collapse col-sm-7 col-lg-7 in ": "navbar-collapse collapse col-sm-7 col-lg-7"}>
                        <ul className="nav navbar-nav navbar-right" style={{display: 'inline'}}>
                          <li><Link activeClass="active" to="fh5co-home" spy={true} smooth={true} offset={-70} duration={500}>{t("Website.nav.home")}</Link></li>
                          <li><Link activeClass="active" to="fh5co-services" spy={true} smooth={true} offset={-70} duration={500}>{t("Website.nav.our_solution")}</Link></li>
                          <li><Link activeClass="active" to="fh5co-pricing" spy={true} smooth={true} offset={-70} duration={500}>{t("Website.nav.pricing")}</Link></li>
                          <li><Link activeClass="active" to="fh5co-pictures" spy={true} smooth={true} offset={-70} duration={500}>{t("Website.nav.pictures")}</Link></li>
                          <li><Link activeClass="active" to="fh5co-footer" spy={true} smooth={true} offset={-70} duration={500}>{t("Website.nav.contact")}</Link></li>
                          <li className="ml-5 alert-warning"><Language /></li>
                        </ul>
                      </CCol>
                  </CNav>
              </CRow>
            </header>

            <section id="fh5co-home" data-stellar-background-ratio="0.5" className="fade-in">
              <div className="gradient"></div>
              <div className="container">
                <div className="text-wrap">
                  <div className="text-inner">
                    <div className="row">
                      <div className="col-md-10 col-md-offset-1 text-center">
                        <h1 className="animate-box black font-weight-bolder visible-xs">{renderHTML(t("Website.nav.label"))}</h1>
                        <video style={{width: "100vh"}} controls className="hidden-xs">
                          <source src="/assets/team-1_teaser.mp4" type="video/mp4" />
                        </video>
                        <div className="call-to-action">
                          <a href="#/login" target="_blank" className="demo animate-box"> <AiOutlineLogin className="mr-2" /> {t("Website.nav.login")}</a>
                          <a href="#/register" target="_blank" className="download animate-box"><MdAccountCircle className="mr-2" />{t("Website.nav.register")} </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="fh5co-services"   className="fade-in">
              <div className="fh5co-services">
                  <CRow className="col-12">
                              <div className="col-md-12 section-heading text-center">
                                  <h2 className="animate-box"><span>{t("Website.nav.our_solution")}</span></h2>
                                  <div className="row">
                                      <div className="col-md-8 col-md-offset-2 subtext animate-box">
                                      </div>
                                  </div>
                              </div>
                  </CRow>
                  <CRow className="lg-col-12 col-sm-12 col-xs-12">
                    <CCol className="col-xs-12 col-sm-4 col-md-4 col-lg-4 text-center">
                      <div className="box-services">
                        <div className="icon animate-box">
                          <span><i><FcCollaboration /></i></span>
                        </div>
                        <div className="fh5co-post animate-box">
                          <h3>{t("Website.solution.title_1")}</h3>
                          <p>{t("Website.solution.desc_1")}</p>
                        </div>
                      </div>
                    </CCol>
                    <CCol className="col-xs-12 col-sm-4  col-md-4 col-lg-4 text-center">
                      <div className="box-services">
                        <div className="icon animate-box">
                          <span><i><FcCalendar /></i></span>
                        </div>
                        <div className="fh5co-post animate-box">
                          <h3>{t("Website.solution.title_2")}</h3>
                          <p>{t("Website.solution.desc_2")}</p>
                        </div>
                      </div>
                    </CCol>
                    <CCol className="col-xs-12 col-sm-3  col-md-3 col-lg-3 text-center">
                      <div className="box-services">
                        <div className="icon animate-box">
                          <span><i><FcShare /></i></span>
                        </div>
                        <div className="fh5co-post animate-box">
                        <h3>{t("Website.solution.title_4")}</h3>
                          <p>{t("Website.solution.desc_4")}</p>
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                  <CRow className="lg-col-12 col-sm-12 col-xs-12">
                    <CCol className="col-xs-12 col-sm-4 col-md-4 col-lg-4 text-center mr-1">
                      <div className="box-services">
                        <div className="icon animate-box">
                          <span><i><FcTodoList /></i></span>
                        </div>
                        <div className="fh5co-post animate-box">
                          <h3>{t("Website.solution.title_5")}</h3>
                          <p>{t("Website.solution.desc_5")}</p>
                        </div>
                      </div>
                    </CCol>
                    <CCol className="col-xs-12 col-sm-4  col-md-4 col-lg-4 text-center">
                      <div className="box-services">
                        <div className="icon animate-box">
                          <span><i><FcDocument /></i></span>
                        </div>
                        <div className="fh5co-post animate-box">
                          <h3>{t("Website.solution.title_3")}</h3>
                          <p>{t("Website.solution.desc_3")}</p>
                        </div>
                      </div>
                    </CCol>
                    <CCol className="col-xs-12 col-sm-3  col-md-3 col-lg-3 text-center">
                      <div className="box-services">
                        <div className="icon animate-box">
                          <span><i><FcSurvey /></i></span>
                        </div>
                        <div className="fh5co-post animate-box">
                        <h3>{t("Website.solution.title_6")}</h3>
                          <p>{t("Website.solution.desc_6")}</p>
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                </div>
            </section>

            <section id="fh5co-pricing"className="fade-in">
              <section className="pricing-section bg-3">
                    <div className="container">
                      <CRow>
                        <div className="col-md-12 section-heading text-center">
                          <h2 className="animate-box">{t("Website.nav.pricing")}</h2>
                        </div>
                      </CRow>
                      <CRow className="col-12">
                        <CCol className="col-md-1 hidden-xs"></CCol>
                        <CCol className="col-md-5 text-center animate-box">
                          <div className="pricing__item  text-center">
                                  <h3 className="pricing__title">{t("Website.pricing.monthly")}</h3>
                                  <div className="pricing__price"><span className="pricing_currency mr-1">$</span>10.00</div>
                                  <p className="pricing__sentence">{t("Website.pricing.monthly_billed")}</p>
                                  <ul className="pricing__feature-list">
                                      <li className="pricing__feature">{t("Website.pricing.feature1")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature2")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature3")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature4")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature5")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature6")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature7")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature8")}</li>
                                  </ul>
                              </div>
                        </CCol>
                        <CCol className="col-md-5 text-center animate-box">
                          <div className="pricing__item  text-center">
                                  <h3 className="pricing__title">{t("Website.pricing.annually")}</h3>
                                  <div className="pricing__price"><span className="pricing_currency">$</span>8.00</div>
                                  <p className="pricing__sentence">{t("Website.pricing.annually_billed")}</p>
                                  <ul className="pricing__feature-list">
                                      <li className="pricing__feature">{t("Website.pricing.feature1")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature2")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature3")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature4")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature5")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature6")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature7")}</li>
                                      <li className="pricing__feature">{t("Website.pricing.feature8")}</li>
                                  </ul>
                              </div>
                        </CCol>
                      </CRow>
                  </div>
              </section>
            </section>

            <section id="fh5co-pictures" className="fade-in">
              <section className="pricing-section">
                    <div className="container">
                      <CRow className="col-12">
                        <div className="col-md-12 section-heading text-center">
                          <h2 className="animate-box">{t("Website.nav.pictures")}</h2>
                        </div>
                      </CRow>
                      <CRow className="col-12">
                        <CCol className="col-md-12 text-center animate-box mb-5">
                          <CCarousel autoSlide={30000} animate={true}>
                            <CCarouselIndicators/>
                            <CCarouselInner>
                              <CCarouselItem>
                                <img className="d-block w-100" src="/assets/images/image1.png" alt="slide 1"/>
                              </CCarouselItem>
                              <CCarouselItem>
                                <img className="d-block w-100" src="/assets/images/image2.png" alt="slide 2"/>
                              </CCarouselItem>
                              <CCarouselItem>
                                <img className="d-block w-100" src="/assets/images/image3.png" alt="slide 3"/>
                              </CCarouselItem>
                            </CCarouselInner>
                            <CCarouselControl direction="prev" style={{filter: 'invert(!00%)'}}/>
                            <CCarouselControl direction="next" className="text-primary"/>
                          </CCarousel>
                        </CCol>
                      </CRow>
                  </div>
              </section>
            </section>

            <section id="fh5co-footer" className="fade-in">
              <div className="container">

                <CRow className="col-12">
                  <CCol className="col-md-12 col-xs-12 col-sm-12 col-lg-4 animate-box">
                    <h3 className="section-title">{t("Website.contact.title")}</h3>
                    <p className="text-left">{t("Website.contact.details")}</p>
                  </CCol>

                  <CCol className="col-md-12 col-xs-12 col-sm-12 col-lg-4 animate-box text-center" >
                    <h3 className="section-title">{t("Website.contact.address")}</h3>
                    <ul className="contact-info text-left">
                      <li><i className="icon-map"></i>1037 Oak St, San Francisco, CA 94117-2316</li>
                      <li><i className="icon-phone"></i>+1 (415) 315-9713</li>
                      <li><i className="icon-envelope"></i><a href="mailto:support@team-1.co">support@team-1.co</a></li>
                      <li><i className="icon-globe"></i><a href="http://team-1.co">team-1.co</a></li>
                    </ul>
                    <h3 className="section-title">{t("Website.contact.social_title")}</h3>
                    <ul className="social-media">
                      <li><a href="https://fb.me/team1LLC" rel="noopener noreferrer" target="_blank" className="facebook"><i className="icon-facebook"></i></a></li>
                      <li><a href="https://linkedin.com/company/team1co/"  rel="noopener noreferrer"  target="_blank" className="linkedIn"><i className="icon-linkedin"></i></a></li>
                    </ul>
                  </CCol>

                  <CCol className="col-md-12 col-xs-12 col-sm-12 col-lg-3 animate-box" >
                    <h3 className="section-title">{t("Website.contact.drop_line")}</h3>
                    {!sent
                    ? <form className="contact-form">
                      <div className="form-group">
                        <label htmlFor="name" className="sr-only">{t("Website.contact.name")}</label>
                        <input type="name" className="form-control" name="name" value={name} onChange={this.change} id="name" placeholder={t("Website.contact.name")} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email" className="sr-only">{t("Website.contact.email")}</label>
                        <input type="email" className="form-control" name="email" value={email} onChange={this.change} id="email" placeholder={t("Website.contact.email")} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="message" className="sr-only">{t("Website.contact.message")}</label>
                        <textarea className="form-control" name="message" id="message" value={message} onChange={this.change} rows="7" placeholder={t("Website.contact.message")}></textarea>
                      </div>
                      <div className="form-group">
                        <input id="btn-submit" className="btn btn-send-message btn-md" value={t("Website.contact.send_message")} disabled={this.getDisabled()} onClick={this.sendMessage} />
                      </div>
                     </form>
                    : <div className="text-success">
                      {t("Website.contact.confirmation")}
                      </div>
                    }
                  </CCol>
                </CRow>
              </div>
            </section>
      </>

    );
  }
}


Website.propTypes = propTypes;
Website.defaultProps = defaultProps;

export default withTranslation()(Website);
