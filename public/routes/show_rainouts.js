const express = require('express')
var router = express.Router();

const mysql = require('mysql');


// connection detail
/*const connection = mysql.createConnection({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b052c9e9d7c49d',
    password: '64931555',
    database: 'heroku_0fab399232beb7b'
})*/


var db_config = {
    host: 'us-cdbr-east-05.cleardb.net',
      user: 'b052c9e9d7c49d',
      password: '64931555',
      database: 'heroku_0fab399232beb7b'
  };
  
var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); 
                                             

    connection.connect(function(err) {             
        if(err) {                                   
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 
            }                                    
        });                                  
                              
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();                        
            } else {                                    
            throw err;                               
            }
        }); 
}

handleDisconnect();

/* GET home page */
router.post('/', (req, res, next) => {
    const body = req.body;
    var reportsByYear = [{ year: '', month: '', count: ''}];
    console.log(body);
    if (body.areaName == 'all' && body.searchMonth == '' && body.searchYear == '') {
        connection.query("SELECT Rainout_ID, DATE_FORMAT(`Date_`,'%Y-%m-%d') AS date, Area_name, rainouts.Area_ID  FROM rainouts, areas WHERE rainouts.Area_ID = areas.Area_ID ORDER BY date DESC;",(error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_rainouts', {rows, reportsByYear})             
            }
        })
    }

    else if (body.areaName == 'all' && body.searchMonth == '' && body.searchYear != '') {
        connection.query("SELECT Rainout_ID, DATE_FORMAT(`Date_`,'%Y-%m-%d') AS date, Area_name, rainouts.Area_ID  FROM rainouts, areas WHERE rainouts.Area_ID = areas.Area_ID AND YEAR(Date_) = ? ORDER BY date DESC;", [body.searchYear], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                
                connection.query(" SELECT YEAR(Date_) AS year, MONTHNAME(Date_) AS month, COUNT(Rainout_ID) AS count FROM rainouts WHERE YEAR(Date_) = ? GROUP BY YEAR(Date_), MONTH(Date_) ORDER BY YEAR(Date_), MONTH(Date_);",[body.searchYear], (error, reportsByYear) => {
                    if(error) throw error;

                    if(!error) {
                    console.log(reportsByYear);
                    res.render('show_rainouts', {rows, reportsByYear}) 
                    }
                })                          
            }
        })
    }

    else if (body.areaName == 'all' && body.searchMonth != '' && body.searchYear != '') {
        connection.query("SELECT Rainout_ID, DATE_FORMAT(`Date_`,'%Y-%m-%d') AS date, Area_name, rainouts.Area_ID  FROM rainouts, areas WHERE rainouts.Area_ID = areas.Area_ID AND MONTH(Date_) = ? AND YEAR(Date_) = ? ORDER BY date DESC;", [body.searchMonth,body.searchYear], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_rainouts', {rows, reportsByYear})            
            }
        })
    }

    else if (body.areaName != 'all' && body.searchMonth == '' && body.searchYear == '') {
        connection.query("SELECT Rainout_ID, DATE_FORMAT(`Date_`,'%Y-%m-%d') AS date, Area_name, rainouts.Area_ID  FROM rainouts, areas WHERE rainouts.Area_ID = areas.Area_ID AND Area_name = ?  ORDER BY date DESC;", [body.areaName], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_rainouts', {rows, reportsByYear})             
            }
        })
    }

    else if (body.areaName != 'all' && body.searchMonth == '' && body.searchYear != '') {
        connection.query("SELECT Rainout_ID, DATE_FORMAT(`Date_`,'%Y-%m-%d') AS date, Area_name, rainouts.Area_ID  FROM rainouts, areas WHERE rainouts.Area_ID = areas.Area_ID AND Area_name = ? AND YEAR(Date_) = ? ORDER BY date DESC;", [body.areaName, body.searchYear], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_rainouts', {rows, reportsByYear})             
            }
        })
    }

    else if (body.areaName != 'all' && body.searchMonth != '' && body.searchYear != '') {
        connection.query("SELECT Rainout_ID, DATE_FORMAT(`Date_`,'%Y-%m-%d') AS date, Area_name, rainouts.Area_ID  FROM rainouts, areas WHERE rainouts.Area_ID = areas.Area_ID AND Area_name = ? AND YEAR(Date_) = ? AND MONTH(Date_) = ? ORDER BY date DESC;", [body.areaName, body.searchYear, body.searchMonth], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_rainouts', {rows, reportsByYear})             
            }
        })
    }
});

module.exports = router;