const express = require('express');
const axios = require('axios');
const moment = require('moment');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send({
        message: 'Hi user! What can I help you with today?'
    });
});
app.post('/', async(req, res) => { 
    if (req.body.message.toLowerCase().indexOf('debit order') > -1 && (req.body.message.toLowerCase().indexOf('balance') > -1 || req.body.message.toLowerCase().indexOf('money') > -1 || req.body.message.toLowerCase().indexOf('amount') > -1)) {
        await axios.get(`https://chat-bot-db.herokuapp.com/user?accountId=${req.body.user}`).then(response => {
            let debitOrders = '';
            response.data.data[0].debitOrders.forEach(item => {
                debitOrders += `${item.name} - R${item.amount}, `;
            });
            res.send({
                message: `Cheque Balance: R${response.data.data[0].balance}. Credit Card Balance: R${response.data.data[0].ccBalance}. Debit Orders: ${debitOrders}`
            });
        }).catch(err => {
            console.log(err);
            res.send(err);
        });  
    } else if (req.body.message.toLowerCase().indexOf('debit order') > -1) {
        await axios.get(`https://chat-bot-db.herokuapp.com/user?accountId=${req.body.user}`).then(response => {
            let debitOrders = '';
            response.data.data[0].debitOrders.forEach(item => {
                debitOrders += `${item.name} - R${item.amount}, `;
            });
            res.send({
                message: `Your debit orders: ${debitOrders}`
            });
        }).catch(err => {
            console.log(err);
            res.send(err);
        });
    } else if (req.body.message.toLowerCase().indexOf('balance') > -1 || req.body.message.toLowerCase().indexOf('money') > -1 || req.body.message.toLowerCase().indexOf('cash') > -1 || req.body.message.toLowerCase().indexOf('amount') > -1) {
        await axios.get(`https://chat-bot-db.herokuapp.com/user?accountId=${req.body.user}`).then(response => {
            res.send({
                message: `Cheque Balance: R${response.data.data[0].balance}. Credit Card Balance: R${response.data.data[0].ccBalance}`
            });
        }).catch(err => {
            console.log(err);
            res.send(err);
        });
    } else if(req.body.message.toLowerCase() === 'hello' || req.body.message.toLowerCase() === 'hi') {
        res.send({message: 'Hello to you too, how can I help you today?'});
    } else if(req.body.message.toLowerCase().indexOf('bye') > -1 ) {
        res.send({message: 'Goodbye! Have a lovely day!'});
    } else {
        res.send({
            message: 'Sorry, please can you rephrase your query?'
        });
    }
});
app.post('/saveMessage', async(req, res) => {
    let fetchChatsForUser = await axios.get('https://chat-bot-db.herokuapp.com/chat');
    let matched = false;
    let matchedEntry = {};
    for(let history of fetchChatsForUser.data.data) {
        if(history.date === moment().format('YYYY-MM-DD')) {
            matched = true;
            matchedEntry = history.chatHistory;
            break;
        }
    }
    if(matched) {
        await axios.put(`https://chat-bot-db.herokuapp.com/chat?accountId=${req.body.user}&date=${moment().format('YYYY-MM-DD')}`, {history: [...matchedEntry, ...req.body.history], status: req.body.status}).then(response => res.send(response.data)).catch(err => {
            console.log(err);
            res.send('History not saved');
        });
    } else {
        let userDetails = await axios.get(`https://chat-bot-db.herokuapp.com/user?accountId=${req.body.user}`);
        let newChat = {
            username: userDetails.data.data.username,
            accountId: req.body.user,
            status: req.body.status,
            history: req.body.history
        }
        await axios.post(`https://chat-bot-db.herokuapp.com/chat`, newChat).then(response => res.send(response.data)).catch(err => {
            console.log(err);
            res.send('History not saved');
        });
    }
})

app.listen(process.env.PORT || 3300, () => {
    console.log('Connected on port 3300');
});