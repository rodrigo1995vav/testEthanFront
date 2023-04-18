import MomentTZ from 'moment-timezone';

const convertDuration = (duration) => {
    var min = duration % 60;
    var hour = (duration - min) / 60;
    min = (min === 0) ? "" : min + "mins";
    hour = (hour === 0) ? "" : hour + "h";
    return hour + min;
}

const getAttendeeClass = (type) => {
    switch (type) {
        case 'organizer':
            return 'danger';
        case 'coHost':
            return 'warning';
        default:
            return 'info';
    }
}

const getRequiredClass = (presence) => {
    return presence === "required" ? "info" : "dark";
}

const getGoalClass = (priority) => {
    switch (priority) {
        case "p5":
            return "danger";
        case "p3":
            return "warning";
        default:
            return "success";
    }
}

const getMeetingClass = (status) => {
    switch (status) {
        case "new":
            return "info";
        case "started":
        case "timer_started":
        case "missed":
            return "warning";
        default:
            return "success";
    }
}

const prepareMailDateTime = (dateTime, timezone, duration) => {
    var r = MomentTZ(dateTime).tz(timezone).format('LL @ LT');
    r += "-" + MomentTZ(dateTime).tz(timezone).add(duration, "minutes").format('LT');
    r += " (" + convertDuration(duration) + ") / ";
    r += "(GMT" + MomentTZ.tz(timezone).format('Z') + ")";

    return r;
}

const prepareMailSubject = (subject, dateTime) => {
    return subject + " // " + dateTime;
}

const prepareMailContent = function(props, dateTime, lng) {
    const { t, meeting, type } = props;
    var content = "";
    var htmlTags = {
        lineBreak: "<br/>",
        listGroup: "<ul>",
        listGroupClose: "</ul>",
        listElement: "<li>",
        listElementClose: "</li>"
    };
    content += t("Invitations.email.line_" + type, { dateTime: dateTime });
    content += htmlTags.lineBreak;
    content += t("Invitations.email.line_subject", { subject: meeting.subject });
    if (meeting.description.length > 0) {
        content += t("Invitations.email.line_description", { description: meeting.description });
    }

    if (type === "request") {
        content += htmlTags.lineBreak;
        content += t("Invitations.email.line_link", { link: process.env.REACT_APP_URL + process.env.REACT_APP_JOINING_URL + meeting.code.replace(/-/g, '') + "?lng=" + lng });
        if (meeting.secure) {
            content += htmlTags.lineBreak;
            content += t("Invitations.email.line_password", { password: meeting.password })
        }
    }

    if (meeting.agenda.length > 0) {
        content += htmlTags.lineBreak + t("Invitations.email.line_title_agenda");
        content += htmlTags.listGroup;
        meeting.agenda.map(function(item, index) {
            content += htmlTags.listElement + item.content + " <span style='color: #39f'>(" + convertDuration(item.duration) + ")</span>" + htmlTags.listElementClose;
            return content;
        })
        content += htmlTags.listGroupClose;
    }
    if (meeting.goals.length > 0) {
        content += t("Invitations.email.line_title_goals");
        content += htmlTags.listGroup;
        meeting.goals.map(function(item, index) {
            content += htmlTags.listElement + item.item + t("Invitations.email.line_priority_" + item.priority) + htmlTags.listElementClose;
            return content;
        })
        content += htmlTags.listGroupClose;
    }
    if (meeting.attendees.length > 0) {
        content += t("Invitations.email.line_title_attendees");
        content += htmlTags.listGroup;
        meeting.attendees.map(function(item, index) {
            content += htmlTags.listElement + item.email + t("Invitations.email.line_presence_" + item.presence) + htmlTags.listElementClose;
            return content;
        })
        content += htmlTags.listGroupClose;
    }
    if (meeting.docs.length > 0) {
        content += t("Invitations.email.line_title_documents");
        content += htmlTags.listGroup;
        meeting.docs.map(function(item, index) {
            content += htmlTags.listElement + "<a href='" + (item.type === "link" ? item.url : process.env.REACT_APP_API_URL + "docs/" + item.url) + "' target='_blank'>" + item.name + "</a>" + htmlTags.listElementClose;
            return content;
        })
        content += htmlTags.listGroupClose;
    }
    if (meeting.notes.length > 0) {
        content += t("Invitations.email.line_title_notes");
        content += meeting.notes;
    }

    content += htmlTags.lineBreak;
    content += htmlTags.lineBreak + "----------------------------------------------" +
        htmlTags.lineBreak + meeting.userInfo[0].fullName + htmlTags.lineBreak + meeting.userInfo[0].email;

    return content;
}


export { convertDuration, getAttendeeClass, getGoalClass, getMeetingClass, getRequiredClass, prepareMailDateTime, prepareMailSubject, prepareMailContent }