const mongoose = require('mongoose');
const Loc = mongoose.model('Location');


//locationsReadOne은 get메소드('/locations/:locationid'로 요청이 들어오면)
const locationsReadOne = (req, res) => {
    Loc
        .findById(req.params.locationid) //쿼리정의
        .exec((err,location)=>{ //실제 실행되는 코드
            if (!location) {
                res
                .status(404) //상태코드
                .json({"message": "location not found_2020700101 Yubin Bae"})
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            }
            res
                .status(200)
                .json(location);
        });

};


const locationsListByDistance = async (req,res) => {  
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const near = { //near:경위도값
        type: "Point",
        coordinates: [lng, lat]
    };
    const geoOptions = { //[배열]distanceField:경위도값과의 거리, max(미터단위): 경위도값에서 반경어디까지 찾아라
        distanceField: "distance.calculated", //near를 기준으로한 현재 location의 거리값(distance)-->, location 객체 자체 반환(distance포함)
        spherical: true, //지구처럼 둥근 표면에서 거리를 계산할 것임, 구의 좌표에 기반하여 검색됨 or flat plane
        maxDistance: 20000, //정해진 경위도 값에서 반경 몇 미터까지 범위 안에서 검색하라(범위지정)
    };
    if (!lng || !lat) {
        return res
            .status(404)
            .json({"message":"lng and lat query parameters are required"})
    };
    try {
        const results = await Loc.aggregate([
            {
                $geoNear: {
                near,
                ...geoOptions // (...)배열을 가져와서 1개 이상의 인자로 확장해주는 오퍼레이터
                }
            }
        ]);
        const locations = results.map(result => { //매핑된 results데이터를 저장할 새 배열 생성
            return {
                _id: result._id,
                name: result.name,
                address: result.address,
                rating: result.rating,
                facilities: result.facilities,
                distance: `${result.distance.calculated.toFixed()}` //정수값으로 변환 후 (m)를 붙여줌
            }
        });
        res
            .status(200)
            .json(locations);
    } catch (err) {
        res
          .status(404)
          .json(err)
    }
};

const locationsCreate = (req,res) => {
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: {
            type: "Point",
            coordinates: [
                parseFloat(req.body.lng),
                parseFloat(req.body.lat)
            ]
        },
        openingTime: [
        {   days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
        },
        {   days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }    
    ]
    },
    (err, location) =>{
        if(err) {
            res
                .status(400)
                .json(err);
        } else {
            res
                .status(201)
                .json(location);
        }
    });
};

const locationsUpdateOne = (req, res) => { // location를 업데이트(갱신)
    if (!req.params.locationid) {
        return res
            .status(404)
            .json({
                "message": "Not found, locationid is required"
            });
    }
    Loc
        .findById(req.params.locationid)
        .select('-reviews -rating') // - 가 있는 이유 : 해당필드만 제외하고 나머지것을 가져온다. (검색하고 싶지 않은것)
        .exec((err, location) => {
            if (!location) {
                return res
                    .status(404)
                    .json({
                        "message": "locationid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(',');
            location.coords = [
                parseFloat(req.body.lng),
                parseFloat(req.body.lat)
            ];
            location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1
                },
                {   days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2
                }]; 
                location.save((err, loc) => {
                    if(err) {
                        res
                            .status(404)
                            .json(err);
                    } else {
                        res
                            .status(200)
                            .json(loc);
                    }
                });
            }
        );
};


const locationsDeleteOne = (req,res) => {
    const {location} = req.params;
    if (location) {
        Loc 
            .findByIdAndRemove(location)
            .exec((err, location) => {
                if (err) {
                    return res
                        .status(404)
                        .json(err);
                }
                res
                    .status(204)
                    .json(null);
            });
    } else {
        res
            .status(404)
            .json({
                "message": "No Location"
            });
    }
};

module.exports = {
    locationsListByDistance,
    locationsCreate,
    locationsReadOne,
    locationsUpdateOne,
    locationsDeleteOne
};