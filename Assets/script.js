$(document).ready(function() {
    $('#searchbutton').on('click', function() {
      var searchValue = $('#searchvalue').val();
      // Empty search input
      $('#searchvalue').val('');
      checkWeather(searchValue);
    });
      // Get value from local storage if any
    $('.history').on('click', 'li', function() {
      checkWeather($(this).text());
    });
    var history = JSON.parse(window.localStorage.getItem('history')) || [];
    if (history.length > 0) {
      checkWeather(history[history.length-1]);
    }
  
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }

    function checkWeather(searchValue) {
      $.ajax({
        type: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/weather?q=' + searchValue + '&appid=fba099b29a5ffb626497317d8143b567&units=imperial',
        dataType: 'JSON',
        success: function(data) {
          if (history.indexOf(searchValue) === -1) {
            history.push(searchValue);
            window.localStorage.setItem('history', JSON.stringify(history));
            makeRow(searchValue);
          }
          // Empty previous value if any
          $('#today').empty();
          // create html content for current weather
          var title = $('<h3>').addClass('card-title').text(data.name + ' (' + new Date().toLocaleDateString() + ')');
          var card = $('<div>').addClass('card');
          var wind = $('<p>').addClass('card-text').text('Wind Speed: ' + data.wind.speed + ' MPH');
          var humid = $('<p>').addClass('card-text').text('Humidity: ' + data.main.humidity + '%');
          var temp = $('<p>').addClass('card-text').text('Temperature: ' + data.main.temp + ' °F');
          var cardBody = $('<div>').addClass('card-body bg-success');
          var img = $('<img>').attr('src', 'https://openweathermap.org/img/w/' + data.weather[0].icon + '.png');
          // merge and append to the page
          title.append(img);
          cardBody.append(title, temp, humid, wind);
          card.append(cardBody);
          $('#today').append(card);
          // call follow-up api endpoints
          getForecast(searchValue);
          getUVIndex(data.coord.lat, data.coord.lon);
        }
      });
    }
    // create row for search area
    function makeRow(text) {
      var li = $('<li>').addClass('list-group-item list-group-item-action').text(text);
      $('.history').append(li);
    }

    function getForecast(searchValue) {
      $.ajax({
        type: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchValue + '&appid=fba099b29a5ffb626497317d8143b567&units=imperial',
        dataType: 'JSON',
        success: function(data) {
          // overwrite any existing content with title and empty row
          $('#forecasts').html('<h4 class=\'mt-3\'>Forecasts for next 5-Day in your search area:</h4>').append('<div class=\'row\'>');
          // loop over all forecasts (by 3-hour increments)
          for (var i = 0; i < data.list.length; i++) {
            // only look at forecasts around 3:00pm
            if (data.list[i].dt_txt.indexOf('15:00:00') !== -1) {
              // create html elements for forcasts bootstrap card
              var col = $('<div>').addClass('col-md-2');
              var card = $('<div>').addClass('card bg-primary text-white');
              var body = $('<div>').addClass('card-body p-2');
              var title = $('<h5>').addClass('card-title').text(new Date(data.list[i].dt_txt).toLocaleDateString());
              var img = $('<img>').attr('src', 'openweathermap.org/img/w/' + data.list[i].weather[0].icon + '.png');
              var p1 = $('<p>').addClass('card-text').text('Temp: ' + data.list[i].main.temp_max + ' °F');
              var p2 = $('<p>').addClass('card-text').text('Humidity: ' + data.list[i].main.humidity + '%');
              // merge together
              col.append(card.append(body.append(title, img, p1, p2)));
              $('#forecasts .row').append(col);
            }
          }
        }
      });
    }
  
    function getUVIndex(lat, lon) {
      $.ajax({
        type: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/uvi?&appid=fba099b29a5ffb626497317d8143b567&lat=' + lat + '&lon=' + lon,
        dataType: 'JSON',
        success: function(data) {
          var uv = $('<p>').text('UV Index: ');
          var btn = $('<span>').addClass('btn btn-sm').text(data.value);
          // change color depending on uv value
          if (data.value < 3) {
            btn.addClass('btn-success');
          }
          else if (data.value < 7) {
            btn.addClass('btn-warning');
          }
          else {
            btn.addClass('btn-danger');
          }
          $('#today .card-body').append(uv.append(btn));
        }
      });
    }
  });