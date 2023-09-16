function convertTime(dateStr) {
    let date = new Date(dateStr);
    return date.toISOString();
}
module.exports = convertTime;