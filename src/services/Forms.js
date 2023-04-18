import _ from 'lodash';
import { isEmail } from "validator";

const isFieldInvalid = function(name, values, validations) {
    var rules = validations(values)[name];
    var fieldValue = values[name];
    var error = false;
    _.forEach(rules, function(v, k) {
        switch (k) {
            case 'empty':
                if (_.isEmpty(fieldValue)) {
                    error = !error ? v : error;
                }
                break;
            case 'required':
                if (fieldValue === "" || _.isNull(fieldValue)) {
                    error = !error ? v : error;
                }
                break;
            case 'min':
                if (_.toString(fieldValue).length < _.toInteger(v[0])) {
                    error = !error ? v[1] : error;
                }
                break;
            case 'matches':
                if (!v[0].test(fieldValue)) {
                    error = !error ? v[1] : error;
                }
                break;
            case 'email':
                if (!isEmail(fieldValue)) {
                    error = !error ? v : error;
                }
                break;
            case 'multipleEmails':
                var separators = /[,;]/;
                var emails = _.split(fieldValue, separators);
                _.each(emails, function(email, index) {
                    if (!isEmail(email) && email.length > 0) {
                        error = !error ? v : error;
                    }
                });
                break;
            case 'equal':
                if (fieldValue !== v[0]) {
                    error = !error ? v[1] : error;
                }
                break;
            case 'not_equal':
                if (fieldValue === v[0]) {
                    error = !error ? v[1] : error;
                }
                break;
            default:
                error = false;
        };
    });

    return error;
}

export { isFieldInvalid }
