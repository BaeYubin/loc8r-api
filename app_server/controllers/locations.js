const request = require('request');
const render = require('../../app');

const apiOptions = {
    server: 'http://localhost:3000' //개발 환경 넣기
};
if (process.env.NODE_ENV === 'production') { //환경변수가 production이면 제품환경(히로쿠)로
    apiOptions.server = 'https://loc8rv2.onrender.com';
}

const requestOptions = {
  url : "http://yourapi.com/api.path",
  method : "GET",
  json : {},
  qs : {
      offset : 20
  }
};

request(
  requestOptions, 
  (err, response, body) => {
  if(err) {
      console.log(err);
  } else if (response.statusCode === 200) {
      console.log(body);
  } else {
      console.log(response.statusCode);
  }
});

//api를 이용해 db로부터 hompage정보를 가져오는 것
const homelist = (req, res) => {
  const path = '/api/locations';
  const requestOptions = {
    uri:`${apiOptions.server}${path}`,
    method: 'GET',
    json: {},
    qs: {
      lng: 126.9708166,
      lat: 37.5548219,
      maxDistance: 200000
    }
  };
  request(
      requestOptions,
      (err, {statusCode}, body) => {
          let data = [];
          if (statusCode === 200 && body.length) {
            data = body.map( (item) => {
              item.distance = formatDistance(item.distance)
              return item;
            });
          };  
          renderHomepage(req, res, data);
      }
  );
};

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit= 'km';
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};
const renderHomepage = function (req, res, responseBody) {
  let message = null;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if(!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render('locations-list', {
      title: 'Loc8r - find a place to work with wifi',
      pageHeader: {
          title: 'Loc8r',
          strapline: 'Find places to work with wifi near you!'
      },
      sidebar: "Looking for wifi and a seat? Loc8r helps you find places\
      to work when out and about. Perhaps with coffee, cake or a pint?\
      Let Loc8r help you find the place you're looking for.",
      locations: responseBody,
      message
    });
  };
  const renderDetailPage = function (req, res, location) {
        res.render('location-info', {
          title: location.name,
          pageHeader: {
            title: location.name
          },
          sidebar: {
            context: 'is on Loc8r because it has accessible wifi and \
            space to sit down with your laptop and get some work done.',
            callToAction: "If you've been and you like it - or if you \
            don't - please leave a review to help other people just like you."
          },
          location : {
            name: '컴포즈커피',
          address: '경기도 화성시 동탄면 산척동 279 중흥에듀클래스에듀하이, 2020700101 배유빈',
          rating: 3,
          facilities: ['Hot drinks', 'Food', 'Premium wifi'],
          coords: {lat:37.173767, lng:127.113786},
          openingTimes: [
            {
            days:"Monday - Friday",
            opening: "8:00am",
            closing: "9:30pm",
            closed: false
          },{
            days: "Saturday",
            opening: "8:00am",
            closing: "9:00pm",
            closed: false
          }
        ],
        reviews:[
          {
            author: "Yubin Bae",
            rating: 5,
            timestamp: "Mar 12, 2020",
            reviewText: "What a great place!!!"
          },
          {
            author: "Yubin Bae",
            rating: 2,
            timestamp: "Mar 12, 2020",
            reviewText: "커피가 써요"
          }
        ]
      }
    });
  };
const renderReviewForm = function (req, res, {name}) {
  res.render('location-review-form', {
    title: `Review ${name} on Loc8r`,
    pageHeader: {title: `Review ${name}`},
    error: req.query.err
  });
};

const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url : `${apiOptions.server}${path}`,
    method : `GET`,
    json:{}
  };
  request(
    requestOptions,
    (err, {statusCode}, body) => {
      let data = body;
      if(statusCode === 200) {
        data.coords = {
          lng : body.coords[0],
          lat : body.coords[1]
        };
        callback(req, res, data);
      } else {
        showError(req, res, statusCode);
      }
    }
  );
};


const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData)
    );
};

// Get 'Add review' page
const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
    );
};

const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };
  if(!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.render(`/lcoation/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
      (err, {statusCode}, {name}) => {
        if(statusCode === 201) {
          res.redirect(`/locations/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
      );
    }
  };
module.exports = { 
  homelist,
  locationInfo,
  addReview,
  doAddReview
};