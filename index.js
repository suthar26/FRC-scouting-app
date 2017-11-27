var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var moment = require('moment');
var postgres = require('./postgres_client.js');
var jwt = require('jsonwebtoken');


var port = process.env.PORT || 3001;
app.use('/scripts', express.static(__dirname + '/node_modules/material-components-web/dist/'));
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
console.log('server is running');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); // use either jade or ejs
// instruct express to server up static assets
app.use(express.static('public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    res.render('index',{
      'title' : 'FRC Scouting App'
    })
});

app.get('/scouting/matchSchedule', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getSchedule(res);
});

app.get('/scouting/elite', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getEliteMatchup(res);
});

app.get('/scouting/sideHangers', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getSideHang(res);
});

app.get('/scouting/shooters', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getShoot(res);
});

app.get('/scouting/hangOrAutoGear', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getHangOrAutoGear(res);
});

app.get('/scouting/hangRank', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getHangRank(res);
});

app.get('/scouting/eliteRank', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    postgres.getEliteBot(res);
});

app.get('/scouting/teamSchedule', function(req, res){

//  res.render('scouting');
    if(req.query.teamNumber != undefined){
        postgres.getMatchesForTeam(req.query.teamNumber, res);
    }else{
        res.send('missing query: teamNumber');
    }
});

app.get('/scouting/opponents', function(req, res){

//  res.render('scouting');
    if(req.query.teamNumber != undefined){
        postgres.getOpponentsWhenRed(req.query.teamNumber, res);
    }else{
        res.send('missing query: teamNumber');
    }
});

app.get('/scouting', function(req, res){

//  res.render('scouting');
    if(req.query.matchNumber != undefined && req.query.station != undefined){
        postgres.getMatch(req.query.matchNumber, req.query.station, res);
    }else{
        res.send('missing query: matchNumber');
    }
});
var scouting_secret = "SutharIsMY5orite";

app.post('/scouting/api/signIn', function(req, res){
    jwt.sign(req.body, scouting_secret, {'expiresIn': '12h'}, function(err, token) {
        if (err){
            console.log(err);
            res.json({'err' : err})
        }
        res.json({'token' : token});
    });
});

app.post('/scouting/api/sendData', function(req, response){
    //console.log(req.query.token);
    //jwt.verify(req.query.token, scouting_secret, function(err, res){
    // if (err){
    //   console.log(err);
    //   res.send(err);
    //   return
    // }
    if (req.body.auto){
        postgres.submitAuto(req.body.auto);
    }
    if (req.body.tele){
        postgres.submitTele(req.body.tele);
    }
    if (req.body.form){
        postgres.submitForm(req.body.form);
    }
    response.send('success');
    //});
});

app.get('/scouting/api/getMatch', function(req, res){
    // jwt.verify(req.query.token, scouting_secret, function(err, res){
    //   if (err){
    //     res.send(err);
    //     return
    //   }

//  });

});
app.get('/scouting/pitStrat', function(req, res){
    if(req.query.matchNumber != undefined){
        postgres.getPitMatch(req.query.matchNumber, res);
        //postgres.viewTeam(188, res);
    }
    else{
        res.send('missing query: matchNumber');
    }
});

app.get('/scouting/viewTeam', function(req, res){
    if(req.query.teamNumber != undefined){
        postgres.viewTeam(req.query.teamNumber, res);
    }
    else{
        res.send('missing query: matchNumber');
    }
});


app.get('/scouting/api/query', function(req, res){
    if(req.query.q){
        postgres.query(req.query.q, res);
    }
    else{
        res.render('query', {'names' : [], 'rows' : [], 'query' : ''});
    }
});

app.post('/scouting/api/insertMatch', function(req, res){
    match = req.body;
    if(match != undefined){
        postgres.insertMatch(match);
        res.send('worked');
    }
    else{
        res.send('not worked');
    }
});
