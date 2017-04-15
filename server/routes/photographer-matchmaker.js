var express = require('express');
var router = express.Router();
// var pool = require('../modules/pg-pool');

router.get('/', function (req, res) {
    if (knownUserPreference === null) {
        knownUserPreference = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var returnPhotos = photos().sort(function () { return 0.5 - Math.random() }).slice(0, 4);
        res.send(returnPhotos);
    } else if (req.body.length > 0) {
        // var haveData = knownUserPreference.some(number => number !== 0);
        if (trainingData) {
            var trainingDatum = {
                before: JSON.parse(JSON.stringify(knownUserPreference))
            }
            req.body.forEach(photo => {
                knownUserPreference[photo.id] = photo.liked;
            });
            trainingDatum.after = JSON.parse(JSON.stringify(knownUserPreference));
            trainingData.push(trainingDatum);
        } else {
            req.body.forEach(photo => {
                knownUserPreference[photo.id] = photo.liked;
            });
            var possiblePhotos = [];
            var allPhotos = photos();
            knownUserPreference.forEach((preference, index) => {
                if (preference === 0) {
                    possiblePhotos.push(allPhotos[index]);
                }
            })
            res.send(possiblePhotos.sort(function () { return 0.5 - Math.random() }).slice(0, 4));
        }
    }
});

module.exports = router;

var knownUserPreference = null;

var trainingData

function photos() {
    return [
        {
            id: 0,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/2IBsNSbJSww6twLv3qmcNU34_v8=/280x204/smart/product/d/a/0fde4a090fec4501b1d53eb8c92e41ff.jpg"
        },
        {
            id: 1,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/tq8jA95oHG4LV66FSXsw7WxMgaU=/280x237/smart/product/7/e/24f2b8aef3414b2ea53112b356e53f87.jpg"
        },
        {
            id: 2,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/2ijaIPc-2lfyn8TrbqN-TFW1F38=/280x336/smart/product/9/c/0522cfbe48bb4a58a3cfe8bba45d3b7f.jpg"
        },
        {
            id: 3,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/-sTctKSnogiwFq6djT9geYl8MSg=/280x312/smart/product/8/4/54d70e2ed5034caea04d971a789e4ebb.jpg"
        },
        {
            id: 4,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/TXEa9EtxL3kO56Ra3p4vTY4MsAY=/280x234/smart/product/a/e/a0ac1c41ca08495087b441ad9f08d55b.jpg"
        },
        {
            id: 5,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/boksU3CLi_bkIgs51S2Cokfj90Y=/280x232/smart/product/a/0/656972b89a9a466db1278e000c773a22.jpg"
        },
        {
            id: 6,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/ntNkd-aScD1nCMogbm0QGqSrvZw=/280x361/smart/product/2/7/fbef689fbcde4fae8dafbe1999966713.jpg"
        },
        {
            id: 7,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/cScnMMPjuen_8tZROFM9QjKJjqQ=/280x204/smart/product/4/f/6a8940aeec2e4dd8aa75c612ed922122.jpg"
        },
        {
            id: 8,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/owDdO4Wfz_6AsZteESSmd-oSZHI=/280x280/smart/product/b/8/07512abb20ee4ba393a5d4fe56aaccf0.jpg"
        },
        {
            id: 9,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/tLKcpvL_C4zKaqdFHPf2xj25pYs=/280x281/smart/product/d/1/144e2ef9f0414874a16d14bc81a383c4.jpg"
        },
        {
            id: 10,
            url: "https://d2ezq7t0wj6z8f.cloudfront.net/hzvNOegD5krTeyYfkb-wnGcX9co=/280x362/smart/product/a/5/557d6af755be436cb1bc540fd9d10344.jpg"
        },

    ]
}