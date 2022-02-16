const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
var jsdom = require('jsdom');
const app = express();
const axios = require('axios');



app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('Public'));
app.set("view engine", "ejs");
const {
    JSDOM
} = jsdom;
const {
    window
} = new JSDOM();
const {
    document
} = (new JSDOM('')).window;
global.document = document;


var $ = jQuery = require('jquery')(window)
const PORT = process.env.PORT || 3000;

var city,Curr_Wea,Curr_City,Curr_Temp,Curr_icon_src="",Curr_Hum,Curr_AP,Curr_Vis,Curr_WS,video_src="";
var daily_date=[],daily_temp=[],daily_hum=[],daily_Rain=[],daily_icon=[],daily_wea=[];
var isUpdated;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/main.html");
})

app.post("/weather", function (req, res) {
    city = req.body.city;
    var weatherData = "",
        WData;
    const url = "https://api.openweathermap.org/data/2.5/find?q=" + city + "&appid=d689a073cf0219f9eca7efba42d7d7f8&units=metric";
    (async () => {
        try {
            const response = await axios.get(url);
            weatherData = response.data;
            if(weatherData.count==0){
                console.log("Wrong City");
                res.redirect("/");
                return;
            }
            const lat = getLatitude(weatherData);
            const lon = getLongitude(weatherData);
            const URL="https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly,alerts&appid=d689a073cf0219f9eca7efba42d7d7f8&units=metric";
            const response2= await axios.get(URL);
            WData=response2.data;
            updateWeather(WData);
            res.render("weather", {
                video_src:video_src,
                Curr_Wea: Curr_Wea,
                Curr_City:Curr_City,
                Curr_Temp:Curr_Temp,
                Curr_icon_src:Curr_icon_src,
                Curr_Hum:Curr_Hum,
                Curr_AP:Curr_AP,
                Curr_Vis:Curr_Vis,
                Curr_WS:Curr_WS,
                daily_Rain:daily_Rain,
                daily_date:daily_date,
                daily_temp:daily_temp,
                daily_wea:daily_wea,
                daily_icon:daily_icon,
                daily_hum:daily_hum
            });
        } catch (error) {
            console.log(error);
        }
    })();
})

function resetData(){
    daily_date=[],
    daily_temp=[],
    daily_hum=[],
    daily_Rain=[],
    daily_icon=[],
    daily_wea=[];
}

function getLatitude(data) {
    return data.list[0].coord.lat;
}

function getLongitude(data) {
    return data.list[0].coord.lon;
}

app.listen(PORT, function () {
    console.log("Server started at Port: 3000");
});

function setVideoSRC(Code){
    var weather="";
    if(Code>=200 && Code<300)weather="Thunderstorm";
    else if(Code>=300 && Code<400)weather="Drizzle";
    else if(Code>=500 && Code<600)weather="Rain";
    else if(Code>=600 && Code<700)weather="Snow";
    else if(Code>=700 && Code<800)weather="Haze";
    else if(Code==800)weather="Clear";
    else if(Code>800 && Code<900)weather="Clouds";
    video_src="Videos/"+weather+".mp4"
}

function updateWeather(WData) {
    resetData();
    setVideoSRC(WData.current.weather[0].id);
    Curr_Wea=WData.current.weather[0].main;   
    Curr_City=city;
    Curr_Temp=WData.current.temp;
    Curr_icon_src="http://openweathermap.org/img/wn/"+WData.current.weather[0].icon+"@2x.png";
    Curr_Hum=WData.current.humidity;
    Curr_AP=WData.current.pressure;
    Curr_Vis=WData.current.visibility;
    Curr_WS=WData.current.wind_speed;
    var options={
        weekday:"long",
        day:"numeric",
        month:"long"
    }
    for(var i=0;i<6;i++){    
    var today=new Date();
    today.setDate(today.getDate()+(i+1));
    var date=today.toLocaleDateString("en-US",options);
    daily_date.push(date);
    daily_temp.push(Math.round(WData.daily[i].temp.max*10)/10);
    daily_hum.push(WData.daily[i].humidity);
    daily_wea.push(WData.daily[i].weather[0].main);
    daily_icon.push("http://openweathermap.org/img/wn/"+WData.daily[i].weather[0].icon+"@2x.png");
    daily_Rain.push(Math.round((WData.daily[i].pop*100)*10)/10);
    }
    
}

