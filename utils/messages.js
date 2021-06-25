const moment = require('momnet')

function formatMessage (userName,text){
    return {
        userName,
        text,
        time:moment().format('h:mm a')
    }
}


module.exports = formatMessage