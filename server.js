const express = require("express");
const request = require("request");
const app = express();

require("dotenv").config();
const myApiKey = process.env.API_KEY;
const baseURL = `http://api.openweathermap.org/data/2.5/weather`;
const baseImg = `http://openweathermap.org/img/wn/`;

app.use(express.static("public"));
app.use(express.urlencoded());
app.set("view engine", "ejs");

const myPort = process.env.PORT || 3000;

app.listen(myPort, () => {
    console.log(`Server open at port ${myPort}`);
})

app.get('/', (req, res) => {
    res.render('index', {
        display: false,
        loading:false,
        weather: null,
        error: null
    })
})

app.post('/', (req, res) => {
    const city = req.body.city_name;
    let uri = `${baseURL}?q=${city}&appid=${myApiKey}&units=metric`
    
    request(uri, (error, response, body) => {
        if(error) {
            console.log(error);
            res.render('index', {
                display:false,
                loading: false,
                weather: null,
                error: 'Connection to Weather API failed!'
            });
        } else {
            let contents = JSON.parse(body);
            
            if(contents.cod === 200) {
                let allRegionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                let weather = {
                    city: contents.name,
                    country: `${allRegionNames.of(contents.sys.country)}`,
                    icon: `${baseImg}${contents.weather[0].icon}@2x.png`,
                    main: contents.weather[0].main,
                    description: contents.weather[0].description,

                    current_temp: contents.main.temp,
                    temp_min: contents.main.temp_min,
                    temp_max: contents.main.temp_max,

                    pressure: contents.main.pressure,
                    humidity: contents.main.humidity,
                    visibility: contents.visibility,
                    clouds: contents.clouds.all,

                    sunrise: contents.sys.sunrise,
                    sunset: contents.sys.sunset,
                    timezone: contents.timezone
                }
                
                res.render('index', {
                    display: true,
                    loading: false,
                    weather,
                    error: null
                })

            } else {
                res.render('index', {
                    display: false,
                    loading: false,
                    weather: null,
                    error: contents.message
                })
            }
        }
    })
})

app.use((req, res) => {
    res.render('404');
})