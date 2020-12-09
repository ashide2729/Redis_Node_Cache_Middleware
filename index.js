const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

app = express();

app.listen( PORT ,()=>{
    console.log(`App listening on port ${PORT}`)
});

app.get('/repos/:username', getRepositoriesFromCache, getRepositories);

function getResponse(username, url){
    return  `<h1> The github url for user ${username} is ${url}</h1>`
}

async function getRepositories(req, res, next){
    try {
        console.log('Requesting data...');
        const {username} = req.params;
        const response = await fetch(`https://api.github.com/users/${username}`);
        const data = await response.json();

        client.setex(username, 120, data.url);
        res.send(getResponse(username, data.url));
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

function getRepositoriesFromCache(req, res, next){  
    const {username} = req.params;

    client.get( username ,(err, data)=>{
        if(err) throw err;

        if( data !== null){
            res.send(getResponse(username, data))
        }else{
            next();
        }
    })
}