import decode from "jwt-decode";
import _ from 'lodash';

const loggedIn = async function() {
    const token = getToken();

    if (token === null) {
        return false;
    } else {
        if (!isTokenExpired(token)) {
            const res = await fetch(prepareURL(process.env.REACT_APP_API_URL_AUTH_CHECK),
                getRequestInit('get', null));
            return res.status === 200 ? true : false;
        }
    }
}

const refreshTokenValid = async function() {
    const token = getRefreshToken();

    if (token === null) {
        return false;
    } else {
        if (!isTokenExpired(token)) {
            var status;
            return await fetch(prepareURL(process.env.REACT_APP_API_URL_AUTH_REFRESH), getRequestInitRefreshToken('get'))
                .then(async res => {
                    status = res.status;
                    return await res.json();
                })
                .then(data => {
                    if (status === 200) {
                        updateToken(data.token);
                        return true;
                    } else {
                        return false;
                    }
                });
        }
    }
}

const isTokenExpired = function(token) {
    try {
        const decoded = decode(token);
        if (decoded.exp < (Date.now() / 1000)) {
            return true;
        } else return false;
    } catch (err) {
        return false;
    }
}

const setToken = function(token) {
    setPicture(token.picture);
    setTimezone(token.timezone);
    localStorage.setItem("userData", JSON.stringify(token));
}

const getToken = function() {
    if (localStorage.getItem("userData")) {
        return JSON.parse(localStorage.getItem("userData")).token;
    }
    return null;
}

const getValue = function(name) {
    if (localStorage.getItem("userData")) {
        var token = JSON.parse(localStorage.getItem("userData")).token;
        var decoded = decode(token);
        return decoded[name];
    }
    return null;
}

const setPicture = function(value) {
    localStorage.setItem("picture", value);
    return null;
}

const getPicture = function() {
    return localStorage.getItem("picture");
}

const setTimezone = function(value) {
    localStorage.setItem("timezone", value);
    return null;
}

const getTimezone = function(value) {
    return localStorage.getItem("timezone");
}

const updateToken = function(token) {
    var data = JSON.parse(localStorage.getItem("userData"));
    data.token = token;
    localStorage.setItem("userData", JSON.stringify(data));
}

const getRefreshToken = function() {
    if (localStorage.getItem("userData")) {
        return JSON.parse(localStorage.getItem("userData")).refreshToken;
    }
    return null;
}

const logout = function() {
    fetch(prepareURL(process.env.REACT_APP_API_URL_AUTH_LOGOUT), getRequestInit('get', null))
        .then(async res => {
            return await res.json();
        })
        .then(data => {
            localStorage.removeItem("userData");
            return true;
        })
}

const initiateTokenRefresher = function() {
    var timeout = decode(getToken()).exp - decode(getToken()).iat;
    timeout -= 60;
    var interval = parseInt(process.env.REACT_APP_TOKEN_LIFE) * 60;
    interval -= 60;
    if (timeout === interval) {
        timeout = null;
    } else {
        timeout = setTimeout(() => {
            refresh();
        }, timeout * 1000);
    }
    interval = setInterval(() => {
        refresh();
    }, interval * 1000)

    return {
        timeout: timeout,
        interval: interval
    };
}

const refresh = function() {
    var status = null;
    fetch(prepareURL(process.env.REACT_APP_API_URL_AUTH_REFRESH), getRequestInitRefreshToken('get'))
        .then(async res => {
            status = res.status;
            return await res.json();
        })
        .then(data => {
            if (status === 200) {
                updateToken(data.token);
                return true;
            } else
                return false;
        })
}

const getRequestInitRefreshToken = function(method) {
    return {
        method: method,
        Accept: "application/json",
        mode: process.env.REACT_APP_API_MODE,
        cache: 'no-cache',
        credentials: process.env.REACT_APP_API_CREDENTIALS,
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Refresh " + getRefreshToken()
        }
    }
}

const getRequestInit = function(method, body) {
    var r = {
        method: method,
        Accept: "application/json",
        mode: process.env.REACT_APP_API_MODE,
        cache: 'no-cache',
        credentials: process.env.REACT_APP_API_CREDENTIALS,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (!_.isNull(getToken())) {
        r.headers.Authorization = "Token " + getToken();
    }
    if (!_.isNull(body)) {
        r.body = JSON.stringify(body);
    }
    return r;
}

const getRequestInitFile = function(method, formData) {
    var r = {
        method: method,
        Accept: "application/json",
        mode: process.env.REACT_APP_API_MODE,
        cache: 'no-cache',
        credentials: process.env.REACT_APP_API_CREDENTIALS,
        body: formData,
        headers: {
            'Authorization': "Token " + getToken()
        }
    }
    return r;
}

const prepareURL = function(url) {
    return process.env.REACT_APP_API_URL + url;
}

export {
    loggedIn,
    refreshTokenValid,
    isTokenExpired,
    setToken,
    getToken,
    getValue,
    setPicture,
    getPicture,
    setTimezone,
    getTimezone,
    updateToken,
    getRefreshToken,
    logout,
    initiateTokenRefresher,
    refresh,
    getRequestInitRefreshToken,
    getRequestInit,
    getRequestInitFile,
    prepareURL
}