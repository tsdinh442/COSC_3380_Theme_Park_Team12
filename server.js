const express   = require("express"),
    bodyParser  = require("body-parser"),
    cors        = require("cors"),   
    path        = require('path'),
    app         = express();

    require('dotenv').config();

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
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });


    ///// code by Tung

//const mysql = require('mysql')
const morgan = require('morgan')
//const bodyParser = require('body-parser')
const { Prohairesis} = require('prohairesis')
//const path = require('path')
//const port = process.env.PORT || 5000
//const app = express()

// connection detail

//var connection;
//function connectDb() {
//   connection = mysql.createConnection({
//        host: 'us-cdbr-east-05.cleardb.net',
//        user: 'bfd83253f0d499',
//        password: '1f65e11b',
//        database: 'heroku_c329452859c091c'
//    });
//  connection.on('error', connectDb()); // probably worth adding timeout / throttle / etc
//}


const mySQLstring = "mysql://b052c9e9d7c49d:64931555@us-cdbr-east-05.cleardb.net/heroku_0fab399232beb7b?reconnect=true"
const database = new Prohairesis(mySQLstring);

//var homepage = require('./public/routes/index')
var search_rainouts = require('./public/routes/search_rainouts');
var search_maintenance = require('./public/routes/search_maintenance');

var modify_maintenance = require('./public/routes/modify_maintenance');
var update_maintenance = require('./public/routes/update_maintenance');


//var ride_freq = require('./public/routes/show_ride_frequency');
var show_rainouts = require('./public/routes/show_rainouts');
var show_maintenances = require('./public/routes/show_maintenances');

var rainout_report = require('./public/routes/report_rainout');
var maintenance_report = require('./public/routes/report_maintenance');
var ridden_ride_report = require('./public/routes/report_ridden_ride');
var admission_report = require('./public/routes/report_admission');

var success = require('./public/routes/success');
//const { NOW } = require("sequelize/types");


app.set("views", path.join(__dirname, "public/views"))
app.set('view engine', 'ejs')

// search
app.use('/search_rainouts', search_rainouts);
app.use('/search_maintenance', search_maintenance);

// modify
app.use('/modify_maintenance', modify_maintenance);
app.use('/update_maintenance', update_maintenance);

// view report
//app.use('/ride_frequency', ride_freq);
app.use('/show_rainouts', show_rainouts);
app.use('/show_maintenances', show_maintenances);

// add report
app.use('/report_rainout', rainout_report);
app.use('/report_maintenance', maintenance_report);
app.use('/report_ridden_ride', ridden_ride_report);
app.use('/report_admission', admission_report);

app.use('/success', success);


app
    .use("/public",express.static(__dirname + "/public"))
    .use(morgan('dev'))

    .use(bodyParser.urlencoded({ extended: false}))
    .use(bodyParser.json())


    
app.post('/rainout', async (req, res) => {
    const body = req.body;
    database.query(`
        SELECT Area_ID
        FROM areas
        WHERE Area_Name = @areaName`, {
            areaName: body.areaName
        })
    .then((area_ID) => {
        //console.log(area_ID);
        database.query(`
            INSERT INTO rainouts (
                Date_, 
                Area_Id
            ) VALUES (
                @date, 
                @area_id
            )
        `, {
            area_id: area_ID[0].Area_ID,
            date: body.rainoutDate,        
        });
    })
        
    
    
    

    /* await database.query(`
        UPDATE rides_coasters 
        SET ride_status = "Closed", closed_reason = "rainout"
        WHERE Area_ID = @area_id;
    `, {
        area_id: body.areaID
    })*/

    res.redirect('/success');
})



app.post('/maintenance', async (req, res) => {
    
    const body = req.body;
    //console.log(body);

    if (body.rideStatus == "On-going") {

        database.query(`
            SELECT Ride_coaster_ID
            FROM rides_coasters
            WHERE Name = @rideName`, {
                rideName: body.rollerCoasterName
        })
        .then((ride_ID) => {
            //console.log(ride_ID)
            database.query(`
            INSERT INTO maintenances (
                Worker_ID,
                Date_Started,
                Date_Completed,
                Rides_Coaster_ID,
                status_
            ) VALUES (           
                @employee_ID,
                @startingDate,
                @completionDate,
                @rollerCoaster_ID,
                @status )
            `, {
                //maintenance_ID: '84',
                employee_ID: body.employee_ID,
                startingDate: body.startingDate, 
                completionDate: body.completionDate, 
                rollerCoaster_ID: ride_ID[0].Ride_coaster_ID,
                status: body.rideStatus        
            })        
        })
        
        await database.query(`
            UPDATE rides_coasters 
            SET ride_status = "Closed", closed_reason = "maintenance"
            WHERE Ride_Coaster_ID = @rollerCoaster_ID;
        `, {
            rollerCoaster_ID: body.rollerCoaster_ID
        });
    }

    if (body.rideStatus == "Completed") {

        console.log(body);

        await database.query(`
            UPDATE maintenances
            SET Date_Completed = NOW(), status_ = @status
            WHERE Maintenance_ID = @maintenanceID;
        `, {
            status: body.rideStatus,
            maintenanceID: body.maintenanceID
        });

        await database.query(`
            UPDATE rides_coasters 
            SET ride_status = "Active", closed_reason = ""
            WHERE Ride_Coaster_ID = (SELECT Rides_coaster_ID FROM maintenances WHERE Maintenance_ID = @maintenanceID);
        `, {
            maintenanceID: body.maintenanceID
        });
    }


    res.redirect('/success');
})

/*app.post('/admision', async (req, res) => {
    
    const body = req.body;
    await database.execute(`
        INSERT INTO admission (
	        admission_date,
	        holiday,
	        total_admission,
	        daily_pass,
            annual_pass,
            senior_pass,
            children_pass,
            online_purchase,
            onsite_purchase,

        ) VALUES (
	        @admission_date,
	        @holiday,
	        @total_admission,
	        @daily_pass,
            @annual_pass,
            @senior_pass,
            @children_pass,
            @online_purchase,
            @onsite_purchase,
        )
    `, {
        date_: body.admissionDate,
        holiday: body.holiday,
        total_admission: body.admission,
        daily_pass: body.dailyPass,
        annual_pass: body.annualPass,
        senior_pass: body.seniorPass,
        children_pass: body.childrenPass,
        online_purchase: body.onlineSold,
        onsite_purchase: body.onsiteSold        
    });
    res.redirect('/success');
}) */

app.post('/ridden_ride', async (req, res) => {
    
    const body = req.body;
    console.log(body);
    database.query(`
            SELECT Ride_coaster_ID
            FROM rides_coasters
            WHERE Name = @rideName`, {
                rideName: body.rideName
        })
        .then((ride_ID) => {
            database.query(`
                INSERT INTO rides (
                    Ride_coaster_ID,
                    Date_,
                    Number_of_passenger
                ) VALUES (
                    @rideID,
                    @rideDate,
                    @NumOfPassenger
                )
            `, {
                rideID: ride_ID[0].Ride_coaster_ID,
                rideDate: body.rideDate,
                NumOfPassenger: body.numberOfPassengers     
            });
        })
        .catch((error) => {
            console.error('Error querying the database users');
            });
    res.redirect('/success');
})

/* app.get('/show_rainouts', (req, res, next) => {
    const body = req.body;
    database.query(`
    SELECT
        Rainout_ID, Date_, Area_name, rainouts.Area_ID
    FROM
        rainouts, areas
    WHERE
    rainouts.Area_ID = areas.Area_ID
    AND (
        Area_name = @areaName
        OR 
        Date_ = @date
        OR
        YEAR(Date_) = @year
        OR (
            MONTH(Date_) = @month 
            AND
            YEAR(Date_) = @year
        )
        OR (
            Area_name = @areaName
            AND 
            Date_ = @date
        )
        OR (
            Area_name = @areaName
            AND 
            MONTH(Date_) = @month 
            AND
            YEAR(Date_) = @year
        )
    )
    `,{
        areaName: body.areaName,
        date: body.searchDate.concat(' 00:00:00'),
        month: body.searchMonth,
        year: body.searchYear

      })
    .then((rows) => {
        res.render('show_rainouts', {rows})
    })
    .catch((error) => {
    console.error('Error querying the database users');
    });
}); */


/* app.post('/show_maintenance', (req, res, next) => {
    const body = req.body;
    //console.log(body);
    database.query(`
            SELECT Ride_coaster_ID
            FROM rides_coasters
            WHERE Name = @rideName`, {
                rideName: body.rollerCoasterName
        })
        .then((ride_ID) => {
            console.log(ride_ID)
            database.query(`
            SELECT
                Date_Started, Date_Completed, Rides_coaster_ID, rides_coasters.Name, status_
            FROM
                maintenances, rides_coasters
            WHERE
                maintenances.Rides_coaster_ID = @rideID
                AND
                maintenances.Rides_coaster_ID = rides_coasters.Ride_coaster_ID
                                    
            `,{
                rideName: body.rollerCoasterName,
                rideID: ride_ID[0].Ride_coaster_ID,
                //month: body.searchMonth,
                //year: body.searchYear

            }) 
            
            .then((rows) => {
                console.log(rows);
                res.render('show_maintenance', {rows})
            })
            .catch((error) => {
            console.error('Error querying the database users');
            });
        })    
}); */

