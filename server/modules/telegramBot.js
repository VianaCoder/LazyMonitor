const axios = require('axios');
require("dotenv").config();

module.exports = {

    async sendMessage (server) {

        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
        const CHAT_ID = process.env.CHAT_ID
    
        return new Promise ((resolve, reject) => {

            message = `<b>NewState: ${server.lastState}</b> \n<b>Server:</b> ${server.name}\n<b>Hostname:</b> ${server.hostname}`
    
            axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, { params: { 'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'HTML'}})
                .then(function(response) {
                    resolve("Sucess")
                })
                .catch(function(error) {
                    console.log(error)
                    resolve("Erro ao enviar mensagem")
                })
        })
    }
};
