const express   = require("express"),
    bodyParser  = require("body-parser"),
    cors        = require("cors"),   
    path        = require('path'),
    app         = express();


/////////////// by Tung ///////////////////////
const mysql = require('mysql')
const morgan = require('morgan')


//require('dotenv').config();

const dbConfig = require("./app/config/db.config.js");

const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
});

function handleDisconnect() {
    //connection = mysql.createConnection(db_config); 
                                             
/*
    connection.connect(function(err) {             
        if(err) {                                   
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 
            }                                    
        });  */                                
                              
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

////////////////////////////

    

    var corsOptions = {
        origin: "*"
    };
    
    app.use(cors(corsOptions));
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", '*');
        res.header("Access-Control-Request-Method", "POST");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(express.static(__dirname + '/public'));
    app.use("/public",express.static(__dirname + "/public"));
    
    app.options('*', cors(corsOptions));
    
    // parse requests of content-type - application/json
    app.use(bodyParser.json());
    
    // parse requests of content-type - application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true })); 

    // simple route
    app.get("/", (req, res) => {
        console.log(__dirname);
        res.sendFile(path.join(__dirname+'/public/index.html'));
    });

    const db = require("./app/models");//include models

    db.sequelize.sync().then(function() {
        console.log('Nice! Database looks fine');
    }).catch(function(err) {
        console.log(err, "Something went wrong with the Database Update!");
    });

    //Include route
    require("./app/routes")(app);

    // set port, listen for requests
   


/////////// code by Tung ///////////////////////////////////////////////




//const bodyParser = require('body-parser')
//const { Prohairesis} = require('prohairesis')
//const path = require('path')
//const port = process.env.PORT || 5000
//const app = express()

// connection detail

/* var connection;
function connectDb() {
   connection = mysql.createConnection({
        host: 'us-cdbr-east-05.cleardb.net',
        user: 'b052c9e9d7c49d',
        password: '64931555',
        database: 'heroku_0fab399232beb7b'
    });
    connection.on('error', connectDb()); // probably worth adding timeout / throttle / etc
} */
/*
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

handleDisconnect(); */



//const mySQLstring = "mysql://b052c9e9d7c49d:64931555@us-cdbr-east-05.cleardb.net/heroku_0fab399232beb7b?reconnect=true"
//const database = new Prohairesis(mySQLstring);

//var homepage = require('./public/routes/index')///////////////////
var search_rainouts = require('./public/routes/search_rainouts');
var search_maintenance = require('./public/routes/search_maintenance');
///////////////////////////////////////////////

//var modify_maintenance = require('./public/routes/modify_maintenance');
//var update_maintenance = require('./public/routes/update_maintenance');


//var ride_freq = require('./public/routes/show_ride_frequency');
//var show_rainouts = require('./public/routes/show_rainouts');
//var show_maintenances = require('./public/routes/show_maintenances');

//var insert_rainouts = require('./public/routes/rainouts');
//var insert_maintenance = require('./public/routes/maintenance');
//var insert_ridden_ride = require('./public/routes/ridden_ride');




var rainout_report = require('./public/routes/report_rainout');
//var maintenance_report = require('./public/routes/report_maintenance');
var ridden_ride_report = require('./public/routes/report_ridden_ride');
//var admission_report = require('./public/routes/report_admission');

var success = require('./public/routes/success');
//const { NOW } = require("sequelize/types");


app.set("views", path.join(__dirname, "public/views"))
app.set('view engine', 'ejs')

// search/////////////////
app.use('/search_rainouts', search_rainouts);
app.use('/search_maintenance', search_maintenance);

////////////////////////

// modify
//app.use('/modify_maintenance', modify_maintenance);
//app.use('/update_maintenance', update_maintenance);

// view report
//app.use('/ride_frequency', ride_freq);
//app.use('/show_rainouts', show_rainouts);
//app.use('/show_maintenances', show_maintenances);

//app.use('/rainout', insert_rainouts);
//app.use('/maintenance', insert_maintenance);
//app.use('/ridden_ride', insert_ridden_ride);




// add report
app.use('/report_rainout', rainout_report);
//app.use('/report_maintenance', maintenance_report);
app.use('/report_ridden_ride', ridden_ride_report);
//app.use('/report_admission', admission_report);

app.use('/success', success);

/*
app
    .use("/public",express.static(__dirname + "/public"))
    .use(morgan('dev'))

    .use(bodyParser.urlencoded({ extended: false}))
    .use(bodyParser.json())
*/


    



/* GET rainout report page */

app.post('/maintenance', (req, res, next) => {
    const body = req.body;

    if (body.rideStatus == "On-going") {

        connection.query("SELECT Ride_coaster_ID FROM rides_coasters WHERE Name = ?", [body.rollerCoasterName], (error, ride_ID) => {
            if(error) throw error;

            if(!error) { 
                connection.query("INSERT INTO maintenances (Worker_ID, Date_Started, Date_Completed, Rides_Coaster_ID, status_) VALUES ( ?, ?, ?, ?, ?);", [body.employee_ID, body.startingDate, body.completionDate, ride_ID[0].Ride_coaster_ID, body.rideStatus], (error) => {
                    if(error) throw error;
                })
            }
        })

        connection.query("UPDATE maintenances SET Date_Completed = NOW(), status_ = @status WHERE Maintenance_ID = ?;", [body.rollerCoaster_ID], (error) => {
            if(error) throw error;
        })
    }

    if (body.rideStatus == "Completed") {

        connection.query("UPDATE maintenances SET Date_Completed = NOW(), status_ = @status WHERE Maintenance_ID = ?;" [body.maintenanceID], (error) => {
            if(error) throw error;
        })

        connection.query("UPDATE rides_coasters SET ride_status = 'Active', closed_reason = '' WHERE Ride_Coaster_ID = (SELECT Rides_coaster_ID FROM maintenances WHERE Maintenance_ID = ?);", [body.maintenanceID], (error) => {
            if(error) throw error;
        })
    }

    res.redirect('/success');

});


app.post('/rainout', (req, res, next) => {
    const body = req.body;

    connection.query("SELECT Area_ID FROM areas WHERE Area_Name = ?;", [body.areaName], (error, area_ID) => {
        if(error) throw error;
        
        if(!error) {                
            connection.query("INSERT INTO rainouts ( Date_, Area_Id) VALUES (?, ?);", [body.rainoutDate, area_ID[0].Area_ID], (error) => {

                if(error) throw error;
                if (!error) {           
                    res.redirect('/success');
                }
            })           
                 
            
        }        
    })    
});

app.get('/report_maintenance', (req, res, next) => {
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


app.post('/ridden_ride', (req, res, next) => {

    const body = req.body;

    connection.query("SELECT Ride_coaster_ID FROM rides_coasters WHERE Name = ?", [body.rideName], (error, ride_ID) => {
        if(error) throw error;
        
        if(!error) {                
            connection.query("INSERT INTO rides (Ride_coaster_ID, Date_, Number_of_passenger) VALUES (?, ?, ?);", [ride_ID[0].Ride_coaster_ID, body.rideDate, body.numberOfPassengers], (error) => {

                if(error) throw error;
                if (!error) {           
                    res.redirect('/success');
                }
            })                       
        }        
    })  
});



app.post('/show_maintenances', (req, res, next) => {
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

app.post('/show_rainouts', (req, res, next) => {
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


app.post('/update_maintenance', (req, res, next) => {
    const body = req.body;
    connection.query("SELECT DATE_FORMAT(`Date_Started`,'%m-%d-%Y') AS date, Rides_coaster_ID, rides_coasters.Name, Maintenance_ID FROM maintenances, rides_coasters WHERE status_ = 'On-going' AND Rides_coaster_ID = Ride_coaster_ID AND (maintenances.Rides_coaster_ID = ? OR rides_coasters.Name = ?);", [body.rollerCoaster_ID, body.rollerCoasterName], (error, rows) => {
        if(error) throw error;
    
        if(!error) {
            
            //console.log(ride_IDs) 
            
            //else {
                res.render('update_maintenance', { rows })
            //}                                 
        }
    })
});

app.get('/modify_maintenance', (req, res, next) => {
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


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});


