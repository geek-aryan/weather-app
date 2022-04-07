let weatherAPIKey="78b98e6a019fafe4dbeeede029441a9a";
let weathereBaseEndpoint="https://api.openweathermap.org/data/2.5/weather?appid="+weatherAPIKey+"&units=metric";
let forecastBaseEndpoint='https://api.openweathermap.org/data/2.5/forecast?units=metric&appid='+weatherAPIKey; 
let geocodingBaseEndpoint='http://api.openweathermap.org/geo/1.0/direct?limit=5&appid='+weatherAPIKey+'&q='; 
let reversegeocodingBaseEndpoint='http://api.openweathermap.org/geo/1.0/reverse?&appid='+weatherAPIKey;
let options={
    enableHighFrequency:true,
    timeout:5000,
    maximumAge:0
};
navigator.geolocation.getCurrentPosition(async(pos)=>{
    let cord=pos.coords;
    let lat=cord.latitude;
    let lon=cord.longitude;
    console.log(lat+', '+lon);
    let endpoint=reversegeocodingBaseEndpoint+'&lat='+lat+'&lon='+lon;
    let resp=await fetch(endpoint);
    let result=await resp.json();
    let city = result[0].name;
    console.log(city)
    weatherForCity(city);
    Swal.fire({
        icon:'success',
        title:'Current Location Found',
        // text: 'City: '+city
    });

},(err)=>{
    console.log(err.code+err.msg);
    Swal.fire({
        icon:'error',
        title:'Current Location Not Found',
        text: err.code+err.msg
    });
});
let datalist=document.querySelector('#suggestions');
let searchInpt=document.querySelector('.weather_search');
let city=document.querySelector('.weather_city');
let day=document.querySelector('.weather_day');
let humidity=document.querySelector('.weather_indicator--humidity>.value');
let wind=document.querySelector('.weather_indicator--wind>.value');
let pressure=document.querySelector('.weather_indicator--pressure>.value');
let temp=document.querySelector('.weather_temperature>.value');
let img=document.querySelector('.weather_image');
let forecastBlock=document.querySelector('.weather_forecast');
let weatherImages=[
    {
        url:'images/broken-clouds.png',
        ids:[803,804]
    },
    {
        url:'images/clear-sky.png',
        ids:[800]
    },
    {
        url:'images/few-clouds.png',
        ids:[801]
    },
    {
        url:'images/mist.png',
        ids:[701,711,721,731,741,751,761,762,771,781]
    },
    {
        url:'images/rain.png',
        ids:[500,501,502,503,504]
    },
    {
        url:'images/scattered-clouds.png',
        ids:[802]
    },
    {
        url:'images/shower-rain.png',
        ids:[520,521,522,531,300,301,302,310,311,312,313,314,321]
    },
    {
        url:'images/snow.png',
        ids:[511,600,601,602,611,612,613,615,616,620,621,622]
    },
    {
        url:'images/thunderstorm.png',
        ids:[200,201,202,210,211,212,221,230,231,232]
    },
]
let getWeatherByCityName=async(city)=>{
    let endpoint=weathereBaseEndpoint+'&q='+city;
    let response=await fetch(endpoint);
    return await response.json();
}

let getForecastByCityID=async(id)=>{
    let endpoint=forecastBaseEndpoint+'&id='+id;
    let result=await fetch(endpoint);
    let forcast=await result.json();
    //console.log(forcast)
    forcastList=forcast.list;
    let daily=[]; 
    forcastList.forEach(day => {
        let date_txt=day.dt_txt;
        date_txt=date_txt.replace(" ","T");
        let date=new Date(date_txt);
        let hours=date.getHours();
        if(hours===12)
        {
            daily.push(day);  
        }
    });
    // console.log(daily);
    return daily;
}

let dayOfWeek=(dt=new Date().getTime())=>{
    return new Date(dt).toLocaleDateString('en-EN',{weekday:'long'})
}

let updateCurrentWeather=(data)=>{
    //console.log(data);
    city.innerText=data.name;
    day.innerText=dayOfWeek();
    humidity.innerText=data.main.humidity;
    temp.innerText=data.main.temp>0?"+"+Math.round(data.main.temp):Math.round(data.main.temp);
    pressure.innerText=data.main.pressure;
    let degree=data.wind.deg;
    let direction;
    if(degree>=45 && degree<=75)
    {
        direction='West';
    }
    else if(degree>75 && degree<=225)
    {
        direction="South";
    }
    else if(degree>225 && degree<=275)
    {
        direction='East';
    }
    else{
        direction='North';
    }
    wind.innerText=direction+", "+data.wind.speed;
    let imgID=data.weather[0].id;
    weatherImages.forEach(obj=>{
        if(obj.ids.indexOf(imgID)!=-1){
            img.src=obj.url;
            // console.log('img work '+obj.url)
        }
    });
}

let weatherForCity=async(city)=>{
    let weather=await getWeatherByCityName(city);
    if(weather.cod==="404")
    {
        Swal.fire({
            icon:'error',
            title:'OOPs..',
            text: 'You typed wrong city name'
        })
        return;
    }
    updateCurrentWeather(weather);
    console.log(weather)
    let forecast=await getForecastByCityID(weather.id);
    updateForecast(forecast);
}

searchInpt.addEventListener('keydown',async(e)=>{
    if(e.keyCode===13){
        weatherForCity(searchInpt.value);
    }
    
});

searchInpt.addEventListener('input',async()=>{
    if(searchInpt.value.length<=2)
        return;
    let endpoint=geocodingBaseEndpoint+searchInpt.value;
    let result = await fetch(endpoint);
    result=await result.json();
    // console.log(result);
    datalist.innerHTML='';
    result.forEach(city=>{
        let option = document.createElement('option');
        option.value=`${city.name}${city.state?','+city.state:''},${city.country}`;
        // console.log(`${city.name},${city.state},${city.country}`);
        datalist.appendChild(option);
    })
})
let updateForecast=(forecast)=>{
    forecastBlock.innerHTML='';
    let forecastItem='';
    forecast.forEach((day)=>{
        let temp=day.main.temp>0?"+"+Math.round(day.main.temp):Math.round(day.main.temp);
        let iconUrl='http://openweathermap.org/img/wn/'+day.weather[0].icon+'@2x.png';
        let dayName=dayOfWeek(day.dt*1000);
        // console.log(dayName);
        forecastItem+=`<article class="weather_forecast_item col-md-2">
        <img
          src="${iconUrl}"
          alt="${day.weather[0].description}"
          class="weather_forecast_icon"
        />
        <h3 class="weather_forecast_day">${dayName}</h3>
        <p class="weather_forecast_temperature">
          <span class="value">${temp}</span> &deg;C
        </p>
      </article>`;
    });
    forecastBlock.innerHTML=forecastItem;
}