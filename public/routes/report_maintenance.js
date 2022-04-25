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

/* GET rainout report page */
router.get('/', (req, res, next) => {
    connection.query("SELECT user_id FROM users WHERE user_type = 'Employee';", (error, employeeID) => {
        if(error) throw error;
        
        if(!error) {
            console.log(employeeID);
            // list of all employee IDs  
            var employee_IDs = [];
            
            for (var i = 0; i < employeeID.length; i++) {
                employee_IDs.push(employeeID[i].user_id);
                }  
                //console.log(employee_IDs)
                res.render('report_maintenance', { employee_IDs })
            }                                      
        })    
});

module.exports = router;