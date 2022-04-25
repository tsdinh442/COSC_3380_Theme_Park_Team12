const express = require('express')
var router = express.Router();

const mysql = require('mysql');


// connection detail
/*const connection = mysql.createConnection({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b052c9e9d7c49d',
    password: '64931555',
    database: 'heroku_0fab399232beb7b'
})


var db_config = {
    host: 'us-cdbr-east-05.cleardb.net',
      user: 'b052c9e9d7c49d',
      password: '64931555',
      database: 'heroku_0fab399232beb7b'
  }; */

const db_config = require('dotenv').config();
  
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
    connection.query("SELECT DATE_FORMAT(`Date_Started`,'%m-%d-%Y') AS date, Rides_coaster_ID, rides_coasters.Name, Maintenance_ID FROM maintenances, rides_coasters WHERE status_ = 'On-going' AND Rides_coaster_ID = Ride_coaster_ID AND (maintenances.Rides_coaster_ID = ? OR rides_coasters.Name = ?);", [body.rollerCoaster_ID, body.rollerCoasterName], (error, rows) => {
        if(error) throw error;
    
        if(!error) {
            
            //console.log(ride_IDs) 
            /*if  ( rows.length == 0 ) {  
                const rows = "NONE"
                connection.query("SELECT Ride_coaster_ID FROM rides_coasters;", (error, rideID) => {
                    if(error) throw error;
                
                    if(!error) {    
                        const ride_IDs = []
                        for (var i = 0; i < rideID.length; i++) {
                            ride_IDs.push(rideID[i].Ride_coaster_ID)
                            }               
                        res.render('modify_maintenance', { ride_IDs, rows});
                    }
                })
            }*/
            //else {
                res.render('update_maintenance', { rows })
            //}                                 
        }
    })
});

module.exports = router;

