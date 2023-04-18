import React from 'react';
import _ from 'lodash';

var auth = require('./services/Auth');

const Dashboard = React.lazy(() =>
    import ('./views/Dashboard/Dashboard'));
const Meetings = React.lazy(() =>
    import ('./views/Meetings/Meetings'));
const Users = React.lazy(() =>
    import ('./views/Users/Users'));
const Projects = React.lazy(() =>
    import ('./views/Projects/Projects'));
const Tasks = React.lazy(() =>
    import ('./views/Tasks/Tasks'));

var routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/meetings', name: 'Meetings', component: Meetings },
    { path: '/tasks', name: 'Tasks', component: Tasks }
];

switch (auth.getValue('role')) {
    case 'Admin':
        /* falls through */

    case 'Superuser':
        routes = _.concat(routes, { path: '/projects', name: 'Projects', component: Projects });
        routes = _.concat(routes, { path: '/users', exact: true, name: 'Users', component: Users });
        /* falls through */

    case 'User':
        /* falls through */

    default:
        /* falls through */
}

export default routes;