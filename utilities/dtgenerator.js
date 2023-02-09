var moment = require('moment');

function generateTimeToday()
{
    // return Date.now();
    var stringTimeNow = `${moment().format('HH')} - ${moment().format('mm')} - ${moment().format('ss')}`;

    return stringTimeNow;

}



function toUnixFormatDate()
{
    var tt;
    tt =  ((parseInt(moment().format('YYYY')) - 2000) * 12 * 31 + (( parseInt(moment().format('MM')) - 1) * 31) + parseInt(moment().format('DD')) - 1) * (24 * 60
        * 60) + ( parseInt(moment().utcOffset('+0000').format('HH')) * 60 +  parseInt(moment().format('mm')) ) * 60 + parseInt(moment().format('ss'));
    return tt;
        
} 



module.exports = {
    generateTimeToday,
    toUnixFormatDate
};