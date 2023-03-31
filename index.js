const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const Chart = require('chart.js');


const app = express()
const port = process.env.PORT || 5000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
const d = new Date();
let year = d.getFullYear();

app.get("/", async (req, res) => {
    res.render("home", { year: year })
})

app.post("/", async (req, res) => {
    try {
        // to get city name
        var q = "Chennai"
        q = req.body.city;
        // to get degree
        deg = req.body.deg;
        /* to get https req and await keyword to wait for the response from the API before returning the
         data using to url for get req
        */
        const url1 = 'https://api.openweathermap.org/data/2.5/weather?q=' + q + '&appid=5ff210587ab66a65168516e6fec53500';
        const response1 = await axios.get(url1)
        const lon = response1.data.coord.lon
        const lat = response1.data.coord.lat

        const url2 = 'https://api.openweathermap.org/data/2.5/air_pollution?lat=' + lat + '&lon=' + lon + '&appid=5ff210587ab66a65168516e6fec53500';
        const url3 = 'https://api.openweathermap.org/data/2.5/forecast?q=' + q + '&cnt=15&appid=5ff210587ab66a65168516e6fec53500'
        const response2 = await axios.get(url2)
        const response3 = await axios.get(url3)
        // collecting data from api for Temperature
        const city = response1.data.name
        const Temperature = response1.data.main.temp
        const feels_like = response1.data.main.feels_like
        const Temperature_min = response1.data.main.temp_min
        const Temperature_max = response1.data.main.temp_max
        const humidity = response1.data.main.humidity
        const sunset = response1.data.sys.sunset
        const sunrise = response1.data.sys.sunrise
        // changing time to indian timeZone
        const date = new Date(sunrise * 1000);
        const dates = new Date(sunset * 1000)
        const time = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric' });
        const times = dates.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric' });

        //function to change Kelvin to Celsius
        function toCelsius(Temperature, feels_like, Temperature_max, Temperature_min) {
            Temperature = Temperature - 273.15
            feels_like -= 273.15
            Temperature_max -= 273.15
            Temperature_min -= 273.15
            //humidity -= 273.15
            return [Math.round(Temperature), Math.round(feels_like), Math.round(Temperature_max), Math.round(Temperature_min)]
        }
        // calling function to change Kelvin to Celsius 
        var val = toCelsius(Temperature, feels_like, Temperature_max, Temperature_min)
        // check for user values
        if (deg == "f") {
            function toFahrenheit(val) {
                val[0] = val[0] * 9 / 5 + 32.
                val[1] = val[1] * 9 / 5 + 32.
                val[2] = val[2] * 9 / 5 + 32.
                val[3] = val[3] * 9 / 5 + 32.
                return [Math.round(val[0]), Math.round(val[1]), Math.round(val[2]), Math.round(val[3])]
            }
            // function calling
            val = toFahrenheit(val)
        }
        // collecting data from api for air_pollution
        const co = response2.data.list[0].components.co
        const no = response2.data.list[0].components.no
        const no2 = response2.data.list[0].components.no2
        const o3 = response2.data.list[0].components.o3
        const so2 = response2.data.list[0].components.so2
        const api = response2.data.list[0].main.aqi
        // get weather forcast for every 3hr for tow day
        var dayForcast = []
        for (let i = 0; i < 15; i++) {
            let k = response3.data.list[i].main.temp
            dayForcast.push(Math.round(k - 273.15))

        }
        console.log(dayForcast)
        const _ = "am"
        const __ = "pm"
        // Assume that you have some data for the chart
        const chartData = {
            labels: [00 + _, 3 + _, 6 + _, 9 + _, 12 + _, 3 + __, 6 + __, 9 + __, 00 + _, 3 + _, 6 + _, 9 + _, 12 + __, 3 + __, 6 + __, 9 + __],
            datasets: [
                {
                    label: 'weather Forcast for 3hr for a day',
                    data: dayForcast,
                    fill: true,
                    borderColor: 'rgb(0, 0, 0)',
                    color: 'rgb(0, 0, 0)',
                    tension: 0
                }
            ]

        }

        // send index.ejs file to render on web page
        res.render("index", {
            year: year, city: city, chartData: chartData, api: api, co: co, no: no, no2: no2, o3: o3, so2: so2, time: time, times: times,
            Temperature: val[0], feels_like: val[1], Temperature_min: val[3], Temperature_max: val[2], humidity: humidity
        });
    }
    // try catch is used to run the server without crash 
    catch (error) {
        console.error(error)
    }
})
//application is running in http://localhost:9000/
app.listen(port, function () {
    console.log("done")
})
