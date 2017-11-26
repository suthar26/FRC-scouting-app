var exports = module.exports = {};

var pg = require('pg');

var config = {
    host: 'ec2-75-101-142-182.compute-1.amazonaws.com',
    port: 5432,
    user: 'qmtmgvowyjofmc',
    password: '4c9449daef728090f72b89f6d1b7f860d2c7ae5d5e0769490d1773537d93264a',
    database: 'd5re8bgor54efi'
};

pg.defaults.ssl = true;
var pool = new pg.Pool(config);
pool.connect(function(err, client, done) {
    if(err) {
        return console.error('error fetching client from pool', err);
    }
    else{
        console.log('pool connected');
    }
});
pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack)
});


exports.getTeams = function(response){
    console.log("Getting all teams");

    var query = "SELECT DISTINCT a.team_number as Team FROM \"autoData\" a ORDER BY a.team_number";
    pool.query(query, function (err, res) {
        var team = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        if(sendTeams(res, team, response)){
            return
        }

    });
};

function sendTeams(teams, team, response) {
    for (i in teams.rows){
        row = teams.rows[i];
        if(!team[i]){
            team[i] = {}
        }
        team[i] = row['team'];
    }

    var columns = ['Team Number'];

    console.log('got teams');
    console.log(team);
    response.send({
      'schedule' : team,
      'title' : "Teams",
      'columns' : columns
    });
    console.log('sent teams');
    return true;
}

exports.getEliteMatchup = function(response){
    console.log("Getting Elite Matchups");
    var query = "SELECT M.match_number, M.r1, M.r2, M.r3, M.b1, M.b2, M.b3 FROM \"matchSchedule\" M WHERE (M.r1 = ANY (SELECT T.team_number FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number) OR M.r2 = ANY (SELECT T.team_number FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number)	OR M.r3 = ANY (SELECT T.team_number FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number))	AND (M.b1 = ANY (SELECT T.team_number FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number) OR M.b2 = ANY (SELECT T.team_number FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number)	OR M.b3 = ANY (SELECT T.team_number FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number)) ORDER BY M.match_number";
    pool.query(query, function (err, res){
      var schedule = {};
      if (err){
          console.log(err);
          response.send(err);
          return
      }
      if(sendMatchup(res, response, schedule)){
          return
      }
    });
}

function sendMatchup(matchSchedule, response, schedule) {
    for (i in matchSchedule.rows){
        row = matchSchedule.rows[i];
        if(!schedule[i]){
            schedule[i] = {}
        }
        schedule[i]['matchNumber'] = row['match_number'];
        schedule[i]['red1'] = row['r1'];
        schedule[i]['red2'] = row['r2'];
        schedule[i]['red3'] = row['r3'];
        schedule[i]['blue1'] = row['b1'];
        schedule[i]['blue2'] = row['b2'];
        schedule[i]['blue3'] = row['b3'];
    }
    console.log('got schedule');
    response.render('index',{
      'schedule' : schedule,
      'title' : 'Interesting Matches',
      'columns': ['Match', 'Red 1','Red 2','Red 3','Blue 1','Blue 2','Blue 3']
    });
    console.log('sent schedule');
    return true;
}

exports.getMatchesForTeam = function(team, response){
    console.log("Getting Matches for $1");
    var teamNumber = [parseInt(team)];
    var query = "SELECT M.match_number, M.r1, M.r2, M.r3, M.b1, M.b2, M.b3 FROM \"matchSchedule\" M WHERE M.r1 = $1 OR M.r2 = $1 OR M.r3 = $1 OR M.b1 = $1 OR M.b2 = $1 OR M.b3 = $1 ORDER BY M.match_number";
    pool.query(query, teamNumber, function (err, res){
      var schedule = {};
      if (err){
          console.log(err);
          response.send(err);
          return
      }
      if(sendMatchesForTeam(res, response, schedule, teamNumber)){
          return
      }
    });
}

function sendMatchesForTeam(matchSchedule, response, schedule, team) {
    for (i in matchSchedule.rows){
        row = matchSchedule.rows[i];
        if(!schedule[i]){
            schedule[i] = {}
        }
        schedule[i]['matchNumber'] = row['match_number'];
        schedule[i]['red1'] = row['r1'];
        schedule[i]['red2'] = row['r2'];
        schedule[i]['red3'] = row['r3'];
        schedule[i]['blue1'] = row['b1'];
        schedule[i]['blue2'] = row['b2'];
        schedule[i]['blue3'] = row['b3'];

    }

    var columns = ['Match','Red 1', 'Red 2', 'Red 3', 'Blue 1', 'Blue 2', 'Blue 3'];

    console.log('got schedule');
    response.render('index',{
      'schedule' : schedule,
      'title' : "Matches for team " + team,
      'columns' : columns
    });
    console.log('sent schedule');
    return true;
}

exports.getOpponentsWhenRed = function(team, response){
    console.log("Getting Matches for $1");
    var teamNumber = [parseInt(team)];
    var query = "SELECT M.match_number, M.b1, M.b2, M.b3 FROM \"matchSchedule\" M WHERE M.r1 = $1 OR M.r2 = $1 OR M.r3 = $1 ORDER BY M.match_number";
    pool.query(query, teamNumber, function (err, res){
      var schedule = {};
      if (err){
          console.log(err);
          response.send(err);
          return
      }
      if(prepOpponentsWhenRed(res, response, schedule, teamNumber)){
          return
      }
    });
}

function prepOpponentsWhenRed(matchSchedule, response, schedule, team) {
    for (i in matchSchedule.rows){
        row = matchSchedule.rows[i];
        if(!schedule[i]){
            schedule[i] = {}
        }
        schedule[i]['matchNumber'] = row['match_number'];
        schedule[i]['blue1'] = row['b1'];
        schedule[i]['blue2'] = row['b2'];
        schedule[i]['blue3'] = row['b3'];

    }

    var columns = ['Match', 'Blue 1', 'Blue 2', 'Blue 3'];

    console.log('got red schedule');
    console.log(schedule);
    var redmatches = {
      'schedule' : schedule,
      'title' : "Opponents for Team " + team + " when Red side",
      'columns' : columns
    };
    getOpponentsWhenBlue(team, response, redmatches);
    return true;
}

function getOpponentsWhenBlue (team, response,redmatches){
    console.log("Getting Matches for $1");
    var teamNumber = [parseInt(team)];
    var query = "SELECT M.match_number, M.r1, M.r2, M.r3 FROM \"matchSchedule\" M WHERE M.b1 = $1 OR M.b2 = $1 OR M.b3 = $1 ORDER BY M.match_number";
    pool.query(query, teamNumber, function (err, res){
      var schedule = {};
      if (err){
          console.log(err);
          response.send(err);
          return
      }
      if(sendOpponentsWhenBlue(res, response, schedule, teamNumber,redmatches)){
          return
      }
    });
}

function sendOpponentsWhenBlue(matchSchedule, response, schedule, team, redmatches) {
    for (i in matchSchedule.rows){
        row = matchSchedule.rows[i];
        if(!schedule[i]){
            schedule[i] = {}
        }
        schedule[i]['matchNumber'] = row['match_number'];
        schedule[i]['red1'] = row['r1'];
        schedule[i]['red2'] = row['r2'];
        schedule[i]['red3'] = row['r3'];


    }

    var columns = ['Match', 'Red 1', 'Red 2', 'Red 3'];

    console.log('got schedule');
    var bluematches = {
      'schedule' : schedule,
      'title' : "Opponents for team " + team + " when Blue side",
      'columns' : columns
    };
    response.render('opponents',{
      'red' : redmatches,
      'blue' : bluematches
    });
    console.log('sent schedule');
    return true;
}

exports.getSideHang = function(response){
    console.log("Getting bots that hang on odd");

    var query = "SELECT DISTINCT a.team_number as Team FROM \"autoData\" a WHERE EXISTS (SELECT * FROM \"teleData\" t WHERE (a.auto_pref_lift='port1' OR a.auto_pref_lift='port3') AND t.hang_duration < 8) ORDER BY a.team_number";
    pool.query(query, function (err, res) {
        var team = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        if(sendSideHang(res, team, response)){
            return
        }

    });
};

function sendSideHang(teams, team, response) {
    for (i in teams.rows){
        row = teams.rows[i];
        if(!team[i]){
            team[i] = {}
        }
        team[i] = row['team'];
    }

    var columns = ['Team Number'];

    console.log('got teams');
    console.log(team);
    response.render('team',{
      'teams' : team,
      'title' : "Side Hangers",
      'columns' : columns
    });
    console.log('sent teams');
    return true;
}

exports.getShoot = function(response){
    console.log("Getting bots that shoot high");

    var query = "SELECT DISTINCT A.team_number FROM \"autoData\" A FULL OUTER JOIN \"teleData\" T ON A.form_id = T.form_id WHERE A.auto_high > 0 OR T.tele_high > 0 ORDER BY A.team_number";
    pool.query(query, function (err, res) {
        var team = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        if(sendShoot(res, team, response)){
            return
        }

    });
};

function sendShoot(teams, team, response) {
    for (i in teams.rows){
        row = teams.rows[i];
        if(!team[i]){
            team[i] = {}
        }
        team[i] = row['team_number'];
    }

    var columns = ['Team Number'];

    console.log('got teams');
    console.log(team);
    response.render('team',{
      'teams' : team,
      'title' : "Teams that shoot high",
      'columns' : columns
    });
    console.log('sent teams');
    return true;
}

exports.getHangOrAutoGear = function(response){
    console.log("Getting bots that hang or score a gear in auto");

    var query = "SELECT a.team_number FROM \"autoData\" a WHERE a.auto_gear > 0 UNION SELECT t.team_number FROM \"teleData\" t where t.hang_duration < 5 ORDER BY team_number";
    pool.query(query, function (err, res) {
        var team = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        if(sendHangOrAutoGear(res, team, response)){
            return
        }

    });
};

function sendHangOrAutoGear(teams, team, response) {
    for (i in teams.rows){
        row = teams.rows[i];
        if(!team[i]){
            team[i] = {}
        }
        team[i] = row['team_number'];
    }

    var columns = ['Team Number'];

    console.log('got teams');
    console.log(team);
    response.render('team',{
      'teams' : team,
      'title' : "Teams that hang or do auto gear",
      'columns' : columns
    });
    console.log('sent teams');
    return true;
}

exports.getHangRank = function(response){
    console.log("Getting bots ranked by hang");

    var query = "SELECT T.team_number, AVG (T.hang_duration), COUNT(T.hang) FROM \"teleData\" T WHERE T.hang = true GROUP BY T.team_number ORDER BY AVG (T.hang_duration)";
    pool.query(query, function (err, res) {
        var team = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        if(sendHangRank(res, team, response)){
            return
        }

    });
};

function sendHangRank(teams, team, response) {
    for (i in teams.rows){
        row = teams.rows[i];
        if(!team[i]){
            team[i] = {}
        }
        team[i]['teamNumber'] = row['team_number'];
        team[i]['hangDurr'] = row['avg'];
        team[i]['hang'] = row['count'];
    }

    var columns = ['Team Number', 'Average Time', 'Hang Count'];

    console.log('got teams');
    console.log(team);
    response.render('ranking',{
      'teams' : team,
      'title' : "Ranking of hangs",
      'columns' : columns
    });
    console.log('sent teams');
    return true;
}

exports.getEliteBot = function(response){
    console.log("Getting elite bots");

    var query = "SELECT T.team_number, round(AVG (T.gears_scored), 2) AS \"gears\", round (AVG (T.tele_high),2) AS \"high\" FROM \"teleData\" T WHERE T.gears_scored > 1 AND T.tele_high > 5 GROUP BY T.team_number ORDER BY AVG (T.gears_scored) DESC, AVG (T.tele_high) DESC";
    pool.query(query, function (err, res) {
        var team = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        if(sendEliteBot(res, team, response)){
            return
        }

    });
};

function sendEliteBot(teams, team, response) {
    for (i in teams.rows){
        row = teams.rows[i];
        if(!team[i]){
            team[i] = {}
        }
        team[i]['teamNumber'] = row['team_number'];
        team[i]['gears'] = row['gears'];
        team[i]['teleHigh'] = row['high'];
    }

    var columns = ['Team', 'Gear Average', 'High Ball Average'];

    console.log('got teams');
    response.render('ranking',{
      'teams' : team,
      'title' : "Elite Bots ranked",
      'columns' : columns
    });
    console.log('sent teams');
    return true;
}

exports.getMatch = function(matchNumber, station, response){
    console.log("Getting Match: " + matchNumber + " for station: " + station);
    var values = [parseInt(matchNumber)];

    var query = "SELECT * FROM public.\"matchSchedule\" WHERE match_number = $1";
    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
            response.send(err);
            return
        }

        response.render('scouting',{
            'teamNumber': res.rows[0][station],
            'matchNumber' : res.rows[0]['match_number'],
            'station': station
        });

    });
};
exports.getSchedule = function(response){
    console.log("Getting Schedule");

    var query = "SELECT * FROM public.\"matchSchedule\" ";
    pool.query(query, function (err, res) {
        var schedule = {};
        if (err){
            console.log(err);
            response.send(err);
            return
        }
        if(sendSchedule(res, response, schedule)){
            return
        }
    });
};


exports.getPitMatch = function(matchNumber, response){
    console.log("Getting pit data for match: " + matchNumber);
    var values = [parseInt(matchNumber)];

    var query = "SELECT * FROM public.\"matchSchedule\" WHERE match_number = $1";
    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
            response.send(err);
            return
        }
        var stations = ['r1', 'r2', 'r3', 'b1', 'b2', 'b3'];
        var teamNumbers = [];
        //console.log(res.rows[0]);

        for(var station in stations){
            teamNumbers.push(res.rows[0][stations[station]]);
        }
        getTeamData(teamNumbers, response, matchNumber);
    });
};

function getTeamData(teamNumbers, response, matchNumber){
    var summary = {};
    var stations = ['r1', 'r2', 'r3', 'b1', 'b2', 'b3'];
    for(i in teamNumbers){
        team = teamNumbers[i] + '';
        color = i<3?'#ba3248':'#4286f4';
        teamSummary = {
            'color' : color,
            'station' : stations[i],
            'matchesPlayed' : 0,
            //'mobility' : 0,
            'autoGear' : 0,
            'autoSidePeg' : 0,
            'autoGearPickup' : 0,
            'autoBallPickup' : 0,
            'autoHigh' : 0,
            'teleGear': 0,
            'teleGearPickup' : 0,
            //  'teleHigh' : 0,
            'hangSuccess': 0,
            'hangDuration' : 0
        };
        summary[team] = teamSummary;
    }
    //summary['teamNumbers'] = teamNumbers;

    //console.log(summary);
    var doneQueries = [false, false];
    var query = "SELECT * FROM public.\"autoData\" WHERE team_number = $1 OR team_number = $2 OR team_number = $3 OR team_number = $4 OR team_number = $5 OR team_number = $6";
    pool.query(query, teamNumbers, function (err, res) {
        if (err){
            console.log(err);
            response.send(err);
            return
        }
        //console.log(res);
        //response.render('pitstrat',{});
        for(i in res.rows){
            row = res.rows[i];
            //console.log(row);
            team = row['team_number'];
            //console.log('reading data for team: ' + team + ' in match: ' + row['match_number']);
            summary[team]['matchesPlayed']++;
            //summary[team]['mobility'] += (row['mobility']*1);
            if (row['auto_gear'] === 1 && row['auto_pref_lift'] !== "port2") {
                summary[team]['autoSidePeg'] += 1;
            }
            summary[team]['autoGear'] += row['auto_gear'];
            summary[team]['autoGearPickup'] += row['auto_gear_pickup'];
            summary[team]['autoBallPickup'] += (row['auto_ball_pickup']*1);
            summary[team]['autoHigh'] += row['auto_high'];
        }
        doneQueries[0] = true;
        if(sendWhenDone(doneQueries, summary, response, matchNumber)){
            return
        }
    });
    var query = "SELECT * FROM public.\"teleData\" WHERE team_number = $1 OR team_number = $2 OR team_number = $3 OR team_number = $4 OR team_number = $5 OR team_number = $6";
    pool.query(query, teamNumbers, function (err, res) {
        if (err){
            console.log(err);
            response.send(err);
            return
        }
        //console.log(res);
        for(i in res.rows){
            row = res.rows[i];
            team = row['team_number'];
            summary[team]['teleGear'] += row['gears_scored'];
            summary[team]['teleGearPickup'] += row['gears_acquired'];
            //summary[team]['teleHigh'] += row['tele_high'];
            summary[team]['hangSuccess'] += (row['hang']*1);
            summary[team]['hangDuration'] += row['hang_duration']*(row['hang']*1);
        }
        doneQueries[1] = true;
        if(sendWhenDone(doneQueries, summary, response, matchNumber)){
            return
        }
    });



}
function sendWhenDone(doneQueries, summary, response, matchNumber){
    if(doneQueries[0] && doneQueries[1]){
        for(team in summary){
            if(summary[team]['matchesPlayed'] == 0){
                continue;
            }

            if(summary[team]['autoGear'] > 0){
                summary[team]['autoSidePeg']= (summary[team]['autoSidePeg']/summary[team]['autoGear']).toFixed(2);
            }

            for(key in summary[team]){
                if(key != 'hangDuration' && key != 'hangSuccess'
                    && key != 'matchesPlayed' && key!='color' && key != 'station'
                    && key != 'autoSidePeg'){
                    summary[team][key] = (summary[team][key]/summary[team]['matchesPlayed']).toFixed(2);
                }
            }
            if(summary[team]['hangSuccess'] > 0){
                summary[team]['hangDuration'] = (summary[team]['hangDuration']/summary[team]['hangSuccess']).toFixed(2);
                summary[team]['hangSuccess'] = (summary[team]['hangSuccess']/summary[team]['matchesPlayed']).toFixed(2);
            }

        }
        //response.json(summary);
        scores = {
            'blue' : {
                'autoGear' : 0,
                'teleGear' : 0,
                'autoKpa' : 0,
                'teleKpa' : 0,
                'hang' : 0,
                'score' : 0
            },
            'red' : {
                'autoGear' : 0,
                'teleGear' : 0,
                'autoKpa' : 0,
                'teleKpa' : 0,
                'hang' : 0,
                'score' : 0
            }
        }



        for(i in summary){
            team = summary[i]
            var color = team['color'] == '#ba3248'? 'red' : 'blue';

            scores[color]['autoGear'] += parseFloat(team['autoGear']);
            scores[color]['teleGear'] += parseFloat(team['teleGear']);
            scores[color]['autoKpa'] += parseFloat(team['autoHigh']);
            scores[color]['teleKpa'] += parseFloat(team['teleHigh']);
            scores[color]['hang'] += parseFloat(team['hangSuccess']);

            console.log(color + 'a: ' + scores[color]['autoGear']);

        }
        for(color in scores){
            if(scores[color]['autoGear'] >= 1){
                scores[color]['score'] += 20;
                console.log(color + ': ' + scores[color]['score']);
            }
            if(scores[color]['autoGear'] >= 3){
                scores[color]['score'] += 20;
                //  console.log(color + ': ' + scores[color]['score']);
            }

            gears = scores[color]['autoGear'] + scores[color]['teleGear'];

            if(gears >= 1){
                scores[color]['score'] += 40;
                //console.log(color + ': ' + scores[color]['score']);
            }
            if(gears >= 3){
                scores[color]['score'] += 40;
                //console.log(color + ': ' + scores[color]['score']);
            }
            if(gears >= 6){
                scores[color]['score'] += 40;
                //console.log(color + ': ' + scores[color]['score']);
            }
            if(gears >= 12){
                scores[color]['score'] += 40;
                //  console.log(color + ': ' + scores[color]['score']);
            }
            scores[color]['score'] += scores[color]['autoKpa'] + scores[color]['teleKpa'];
            scores[color]['score'] += scores[color]['hang']*50.0;
            //console.log(color + ': ' + scores[color]['score']);
        }


        response.render('matchview', {'summary' : summary, 'title': 'Match View','matchNumber' : parseInt(matchNumber),'columns' : ['Station', 'mPlayed', 'aGear', 'aSide', 'aGearP','aBallP','aHigh','tGear','tGearP', 'hangSucc','hangDur']});
        console.log('sent pit data');
        return true;
    }
}

exports.viewTeam = function(teamNumber, response){
    console.log('getting team data for: ' + teamNumber);
    var values = [parseInt(teamNumber)];
    var doneQueries = [false, false];
    var summary = {};

    var query = "SELECT * FROM public.\"autoData\" WHERE team_number = $1";//, public.\"teleData\" WHERE team_number = $1";

    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
            response.send(err);
            return
        }
        //console.log('got auto');
        doneQueries[0] = true;
        if(sendTeamData(res, response, true, doneQueries, summary, teamNumber)){
            return
        }
    });

    query = "SELECT * FROM public.\"teleData\" WHERE team_number = $1";//, public.\"teleData\" WHERE team_number = $1";

    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
            response.send(err);
            return
        }
        //console.log('got tele');
        doneQueries[1] = true;
        if(sendTeamData(res, response, false, doneQueries, summary, teamNumber)){
            return
        }
    });
};

function sendTeamData(teamData, response, auto, doneQueries, summary, teamNumber){
    for(i in teamData.rows){
        row = teamData.rows[i];
        if(!summary[i]){
            summary[i] = {}
        }
        if(auto){
            summary[i]['matchNumber'] = row['match_number'];
            summary[i]['mobility'] = (row['mobility']*1);
            summary[i]['autoGear'] = row['auto_gear'];
            summary[i]['autoGearPickup'] = row['auto_gear_pickup'];
            summary[i]['autoBallPickup'] = (row['auto_ball_pickup']*1);
            summary[i]['autoHigh'] = row['auto_high'];
        }
        else{
            summary[i]['teleGear'] = row['gears_scored'];
            summary[i]['teleGearPickup'] = row['gears_acquired'];
            summary[i]['teleHigh'] = row['tele_high'];
            summary[i]['hangSuccess'] = (row['hang']*1);
            summary[i]['hangDuration'] = row['hang_duration'];
        }
    }
    console.log(doneQueries[0] + ': ' + doneQueries[1]);
    if(doneQueries[0] && doneQueries[1]){
        console.log(summary);
        response.render('teamview', {'summary' : summary,'title':'Team View', 'teamNumber' : teamNumber,'columns' :['matchNumber', 'Mobility','aGear','aGearP','aBallP','aHigh','tGear','tGearP','tHigh','hangSucc','hangDur']});
        console.log('sent data for team');
        return true;
    }
    return false;

    //console.log(summary);
//  response.send();
}

function sendSchedule(matchSchedule, response, schedule) {
    for (i in matchSchedule.rows){
        row = matchSchedule.rows[i];
        if(!schedule[i]){
            schedule[i] = {}
        }
        schedule[i]['matchNumber'] = row['match_number'];
        schedule[i]['red1'] = row['r1'];
        schedule[i]['red2'] = row['r2'];
        schedule[i]['red3'] = row['r3'];
        schedule[i]['blue1'] = row['b1'];
        schedule[i]['blue2'] = row['b2'];
        schedule[i]['blue3'] = row['b3'];
    }
    console.log('got schedule');
    response.render('index',{'schedule' : schedule,'title':'Match Schedule','columns': ['Match', 'Red 1','Red 2','Red 3','Blue 1','Blue 2','Blue 3']});
    console.log('sent schedule');
    return true;
}

exports.submitAuto = function(auto){
    console.log("Submiting Auto");
    var values = Object.keys(auto).map(key => auto[key])
    var query = "INSERT INTO public.\"autoData\"(form_id, team_number, match_number, starting_pos, mobility, auto_ball_pickup, auto_high, auto_low, auto_gear_pickup, auto_pref_lift, auto_gear) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);";
    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
        }
    });
};

exports.insertMatch = function(match){
    var values = Object.keys(match).map(key => match[key])
    var query = "INSERT INTO public.\"matchSchedule\"(match_number, r1, r2, r3, b1, b2, b3) VALUES ($1, $2, $3, $4, $5, $6, $7);";
    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
        }
    });
}

exports.submitTele = function(tele){
    console.log("Submiting Tele");
    var values = Object.keys(tele).map(key => tele[key])

    var query = "INSERT INTO public.\"teleData\"(form_id, team_number, match_number, pressure, ground_pickup, tele_high, tele_low, gears_acquired, gears_scored, pref_lift, hang, hang_duration, hang_davit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);";
    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
        }
    });
};

exports.query = function(query, response){
    console.log("TRYING QUERY : " + query);
    pool.query(query, function (err, res) {
        if (err){
            console.log(err);
        }
        else{
            names = [];
            for(index in res.fields){
                names.push(res.fields[index].name);
            }
            response.render('query', {"names":names, "rows": res.rows, 'query' : query});
            console.log(res);
        }
    });
}

exports.submitForm = function(form){
    console.log("Submiting form");
    var values = Object.keys(form).map(key => form[key]);

    var query = "INSERT INTO public.\"formData\"(form_id, team_number, match_number, gear_bot, shot_bot, defend_bot) VALUES ($1, $2, $3, $4, $5, $6);";
    pool.query(query, values, function (err, res) {
        if (err){
            console.log(err);
        }
    });
};
