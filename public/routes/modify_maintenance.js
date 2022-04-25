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

/* GET rainout report page */
router.get('/', (req, res, next) => {
    connection.query("SELECT Ride_coaster_ID, Name FROM rides_coasters;", (error, rideID) => {
        if(error) throw error;
        
        if(!error) {
            // list of all rides  
            var ride_IDs = [];
            var ride_names = [];
            // list of all rides in maintenance
            
            for (var i = 0; i < rideID.length; i++) {
                ride_IDs.push(rideID[i].Ride_coaster_ID);
                ride_names.push(rideID[i].Name)
                }  
            connection.query("SELECT Rides_coaster_ID, Name FROM rides_coasters, maintenances WHERE status_ = 'On-going' AND Rides_coaster_ID = Ride_coaster_ID;", (error, on_going) => {
                console.log(on_going)
                var on_going_maintenance = [];
                var on_going_maintenance_names = [];
                if (error) throw error;

                if (!error) {           
                    for (var i = 0; i < on_going.length; i++) {
                        on_going_maintenance.push(on_going[i].Rides_coaster_ID);
                        on_going_maintenance_names.push(on_going[i].Name)
                    }  
                }

                res.render('modify_maintenance', { ride_IDs, ride_names, on_going_maintenance, on_going_maintenance_names });
            })           
                 
            
        }        
    })    
});

module.exports = router;