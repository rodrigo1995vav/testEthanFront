import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';

var auth = require("./../../services/Auth");

class Activate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    }
  }

  async componentDidMount() {
      const res = await fetch(auth.prepareURL(process.env.REACT_APP_API_URL_AUTH_ACTIVATE),
                                auth.getRequestInit('post', {token: this.props.match.params.token}));
      var state = this.state;
      if(res.status === 200)
      {
        sessionStorage.setItem("userActivated", true);
      }
      state.redirect = true;
      this.setState(state);
  }

  render() {
      const {redirect} = this.state;

      if (redirect) {
          return <Redirect to={process.env.REACT_APP_LOGIN_URL} /> ;
      }

      return   <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
  }
}

export default Activate;
