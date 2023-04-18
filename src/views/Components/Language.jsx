import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import {
  CIconRaw
} from '@coreui/icons-react';

import MetaTags from 'react-meta-tags';

import i18n from './../../services/i18n';

class Language extends Component {

  changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  }

  toKebabCase = (str) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }

  render() {
    switch(i18n.language)
    {
      case "es":
        return (
                <CDropdown className="m-1 btn-group bg-white">
                   <MetaTags>
                    <title>TEAM-1.CO - Reuniones más eficientes!</title>
                    <meta id="meta-description" name="description" content="TEAM-1.CO es una plataforma de administración de reuniones que brinda la capacidad de programar reuniones, realizarlas utilizando múltiples funciones como auditoría, video, chat, pizarra y muchas otras. La principal ventaja de usar esta plataforma es ganar eficiencia y tomar el control sobre las reuniones!" />
                    <meta name="keyword" content="Reuniones, efectivo, eficiente, tiempo, tarea, informes, calendario, video, auditoría, chat, pizarra, comunicación" />
                  </MetaTags>
                  <CDropdownToggle color="" size="sm">
                    <CIconRaw name={this.toKebabCase("cifEs")} size="sm"/>&nbsp;Español
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={() => { this.changeLanguage("fr") }}><CIconRaw name={this.toKebabCase("cifFr")} size="sm"/>&nbsp;Français</CDropdownItem>
                    <CDropdownItem onClick={() => { this.changeLanguage("en") }}><CIconRaw name={this.toKebabCase("cifGb")} size="sm"/>&nbsp;English</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
        );
      case "fr":
          return (
                <CDropdown className="m-1 btn-group bg-white">
                  <MetaTags>
                    <title>TEAM-1.CO - Des réunions plus efficaces!</title>
                    <meta name="description" content="FR TEAM-1.CO est une plate-forme de gestion de réunions permettant de planifier des réunions, de les exécuter à l'aide de plusieurs fonctionnalités telles que l'audio, la vidéo, le chat, le tableau blanc et de nombreuses autres fonctionnalités. Le principal avantage de l'utilisation de cette plateforme est de gagner en efficacité en prenant le contrôle des réunions!" />
                    <meta name="keyword" content="Réunions, efficace, efficacité, temps, tâche, rapports, calendrier, vidéo, audit, chat, tableau blanc, communication" />
                  </MetaTags>
                  <CDropdownToggle color="" size="sm">
                    <CIconRaw name={this.toKebabCase("cifFr")} size="sm"/>&nbsp;Français
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={() => { this.changeLanguage("en") }}><CIconRaw name={this.toKebabCase("cifGb")} size="sm"/>&nbsp;English</CDropdownItem>
                    <CDropdownItem onClick={() => { this.changeLanguage("es") }}><CIconRaw name={this.toKebabCase("cifEs")} size="sm"/>&nbsp;Español</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
          );
      default:
          return (
              <CDropdown className="m-1 btn-group bg-white">
                 <MetaTags>
                    <title>TEAM-1.CO - Making meetings more efficient!</title>
                    <meta name="description" content="TEAM-1.CO is a meeting management platform giving the ability to schedule meetings, perform them using multiple features such as audit, video, chat, whiteboard and many other features. The main advantage of using this platform is to gain efficiency by taking control over the meetings!" />
                    <meta name="keyword" content="Meetings, Efficient, Time, Task, Reporting, Calendar, Video, Audit, Chat, Whiteboard, Communication" />
                  </MetaTags>
              <CDropdownToggle color="" size="sm">
                <CIconRaw name={this.toKebabCase("cifGb")} size="sm"/>&nbsp;English
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => { this.changeLanguage("fr") }}><CIconRaw name={this.toKebabCase("cifFr")} size="sm"/>&nbsp;Français</CDropdownItem>
                <CDropdownItem onClick={() => { this.changeLanguage("es") }}><CIconRaw name={this.toKebabCase("cifEs")} size="sm"/>&nbsp;Español</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            );
    }
  }
}

Language.propTypes = {
  children: PropTypes.node,
};

Language.defaultProps = {};


export default Language;
