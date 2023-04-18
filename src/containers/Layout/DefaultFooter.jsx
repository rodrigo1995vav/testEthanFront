import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import Language from './../../views/Components/Language';

class DefaultFooter extends Component {

  render() {
    const {t} = this.props;
    return (
      <React.Fragment>
        <div className="col-4">
          &copy; 2020 TEAM-1.CO
        </div>
        <div className="col-4 text-center">
          <span>{t("DefaultFooter.text")} </span>
          <a href={process.env.REACT_APP_PUBLIC_URL} target="_blank" rel="noopener noreferrer">TEAM-1.CO</a>
        </div>
        <div className="col-4 text-right">
            <Language />
        </div>
      </React.Fragment>
    );
  }
}


export default withTranslation()(DefaultFooter);
