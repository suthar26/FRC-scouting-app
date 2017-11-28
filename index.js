var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var moment = require('moment');
var postgres = require('./postgres_client.js');
var api = require('./api.js');
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
      'title' : 'Vanguard - FRC Scouting APP',
      'links' : links
    })
});
var links = [
  {
    'name' : 'Match Schedule',
    'url' : '/scouting/matchSchedule'
  },
  {
    'name' : 'Exciting Matchups',
    'url' : '/scouting/elite'
  },
  {
    'name' : 'Side Hanging Robots',
    'url' : '/scouting/sideHangers'
  },
  {
    'name' : 'Ball Shooter robots',
    'url' : '/scouting/shooters'
  },
  {
    'name' : 'Complimentary Robot (Hang or Auto Gear)',
    'url' : '/scouting/hangOrAutoGear'
  },
  {
    'name' : 'Hangers',
    'url' : '/scouting/hangRank'
  },
  {
    'name' : 'Outstanding Rank',
    'url' : '/scouting/eliteRank'
  },
  {
    'name' : 'Match Schedule by Team',
    'url' : '/scouting/teamSchedule?teamNumber=188'
  },
  {
    'name' : 'Opponets for Team 188',
    'url' : '/scouting/opponents?teamNumber=188'
  },
  {
    'name' : 'View Match Summary',
    'url' : '/scouting/pitStrat?matchNumber=10'
  },
  {
    'name' : 'View Team',
    'url' : '/scouting/viewTeam?teamNumber=188'
  },
  {
    'name' : 'API call get team data',
    'url' : '/scouting/api/getTeam?teamNumber=188'
  },
  {
    'name' : 'API call get match Summary',
    'url' : '/scouting/api/matchSummary?matchNumber=10'
  },
];

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


app.get('/scouting/pitStrat', function(req, res){
    if(req.query.matchNumber != undefined){
        postgres.getPitMatch(req.query.matchNumber, res);
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

app.get('/scouting/api/getTeam', function(req, res){
    if(req.query.teamNumber != undefined){
        api.getTeam(req.query.teamNumber, res);
    }
    else{
        res.send('missing query: matchNumber');
    }
});
app.get('/scouting/api/matchSummary', function(req, res){
    if(req.query.matchNumber != undefined){
        api.getMatchSummary(req.query.matchNumber, res);
    }
    else{
        res.send('missing query: matchNumber');
    }
});
