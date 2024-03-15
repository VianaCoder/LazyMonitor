const axios = require('axios');
require("dotenv").config();

module.exports = {

    async reportNewState (server, test, state) {

        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
        const CHAT_ID = process.env.CHAT_ID
    
        return new Promise ((resolve, reject) => {

            message = `🚨 <b> NewState in ${test}:</b> ${state} \n\n<b>Server:</b> ${server.name}\n\n<b>Hostname:</b> ${server.hostname}`
    
            axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { params: { 'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'HTML'}})
                .then(function(response) {
                    resolve("Sucess")
                })
                .catch(function(error) {
                    console.log(error)
                    resolve("Send message failed")
                })
        })
    },

    async reportProblem (test , description) {
        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
        const CHAT_ID = process.env.CHAT_ID
    
        return new Promise ((resolve, reject) => {

            message = `<b>Report Problem in ${test}\n <b>Description:</b> ${description}`
    
            axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { params: { 'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'HTML'}})
                .then(function(response) {
                    resolve("Sucess")
                })
                .catch(function(error) {
                    console.log(error)
                    resolve("Send message failed")
                })
        })
    }
};
