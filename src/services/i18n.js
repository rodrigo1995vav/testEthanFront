import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";

import Moment from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/fr';
import 'moment/locale/es';

import en from "../translations/en.json";
import fr from "../translations/fr.json";
import es from "../translations/es.json";

i18n
    .use(initReactI18next)
    .use(detector)
    .init({
        debug: (process.env.NODE_ENV === "development" ? true : false),
        interpolation: { escapeValue: false },
        fallbackLng: "en",
        saveMissing: true,
        contextSeparator: false,
        pluralSeparator: false,
        keySeparator: '.',
        whitelist: ['en', 'fr', 'es'],
        resources: {
            en: {
                translation: en,
            },
            fr: {
                translation: fr
            },
            es: {
                translation: es
            },
        },
    });

var result = window.location.href.match(/\?lng=(en|fr|es)/);
if (result && result.length === 2) {
    i18n.changeLanguage(result[1]);
}

Moment.locale(i18n.language !== "en" ? i18n.language : "en-gb");

export default i18n;