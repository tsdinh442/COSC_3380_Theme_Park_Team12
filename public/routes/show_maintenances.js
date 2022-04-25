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
    if (body.rollerCoasterName == 'all' && body.searchMonth == '' && body.searchYear == '') {
        connection.query("SELECT DATE_FORMAT(`Date_Started`,'%Y-%m-%d') AS date_started, DATE_FORMAT(`Date_Completed`,'%Y-%m-%d') AS date_completed, Rides_coaster_ID, rides_coasters.Name, status_ FROM maintenances, rides_coasters WHERE maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID ORDER BY date_started DESC;",(error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_maintenances', {rows})             
            }
        })
    }

    else if (body.rollerCoasterName == 'all' && body.searchMonth == '' && body.searchYear != '') {
        connection.query("SELECT DATE_FORMAT(`Date_Started`,'%Y-%m-%d') AS date_started, DATE_FORMAT(`Date_Completed`,'%Y-%m-%d') AS date_completed,Rides_coaster_ID, rides_coasters.Name, status_  FROM maintenances, rides_coasters WHERE maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID AND YEAR(Date_Started) = ? ORDER BY date_started DESC;", [body.searchYear], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_maintenances', {rows})             
            }
        })
    }

    else if (body.rollerCoasterName == 'all' && body.searchMonth != '' && body.searchYear != '') {
        connection.query("SELECT DATE_FORMAT(`Date_Started`,'%Y-%m-%d') AS date_started, DATE_FORMAT(`Date_Completed`,'%Y-%m-%d') AS date_completed,Rides_coaster_ID, rides_coasters.Name, status_  FROM maintenances, rides_coasters WHERE maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID AND YEAR(Date_Started) = ? AND MONTH(Date_Started) = ? ORDER BY date_started DESC;", [body.searchYear, body.searchMonth], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_maintenances', {rows})            
            }
        })
    }

    else if (body.rollerCoasterName != 'all' && body.searchMonth == '' && body.searchYear == '') {
        connection.query("SELECT DATE_FORMAT(`Date_Started`,'%Y-%m-%d') AS date_started, DATE_FORMAT(`Date_Completed`,'%Y-%m-%d') AS date_completed,Rides_coaster_ID, rides_coasters.Name, status_ FROM maintenances, rides_coasters WHERE maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID AND rides_coasters.Name = ? ORDER BY date_started DESC;", [body.rollerCoasterName], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_maintenances', {rows})             
            }
        })
    }

    else if (body.rollerCoasterName != 'all' && body.searchMonth == '' && body.searchYear != '') {
        connection.query("SELECT DATE_FORMAT(`Date_Started`,'%Y-%m-%d') AS date_started, DATE_FORMAT(`Date_Completed`,'%Y-%m-%d') AS date_completed,Rides_coaster_ID, rides_coasters.Name, status_  FROM maintenances, rides_coasters WHERE maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID AND rides_coasters.Name = ? AND YEAR(Date_Started) = ? ORDER BY date_started DESC;", [body.rollerCoasterName, body.searchYear], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_maintenances', {rows})             
            }
        })
    }

    else if (body.rollerCoasterName != 'all' && body.searchMonth != '' && body.searchYear != '') {
        connection.query("SELECT DATE_FORMAT(`Date_Started`,'%Y-%m-%d') AS date_started, DATE_FORMAT(`Date_Completed`,'%Y-%m-%d') AS date_completed,Rides_coaster_ID, rides_coasters.Name, status_  FROM maintenances, rides_coasters WHERE maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID AND rides_coasters.Name = ? AND YEAR(Date_Started) = ? AND MONTH(Date_Started) = ? ORDER BY date_started DESC;", [body.rollerCoasterName, body.searchYear, body.searchMonth], (error, rows) => {
            if(error) throw error;
        
            if(!error) {
                console.log(rows);
                res.render('show_maintenances', {rows})             
            }
        })
    }
});

module.exports = router;