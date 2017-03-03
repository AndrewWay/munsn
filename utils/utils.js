
exports.getIdFromEmail = function(email) {
    var id = email.substring(0, email.indexOf("@"));
    return id;
};

exports.addMinsToDate = function(date, mins) {
    return new Date(date.getTime() + mins*60000);
};