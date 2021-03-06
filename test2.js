// BASED OFF SAMPLE SEARCH CRITERIA

// Opens File and turns it into usable content. NEED SOME HELP HERE
var fs = require("fs");
//Sample search JSON object
var search = fs.readFileSync("search.json");
var searchInfo = JSON.parse(search);

var S_minPrice = searchInfo['minPrice'];
var S_maxPrice = searchInfo['maxPrice'];
var S_beds = searchInfo['beds'];
//Lists
var priceDiffs = {};
var views = {};
var messages = {};
var images = {};
var scoring = {};
var actualRanking = [];
//URL
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var https = require('https');
/*
    ASSUMES API GIVES ONLY APARTMENTS THAT MATCHES CRITERIA:
    -Price Difference is always positive and above searcher's minimum price
    -Took out bed
    -Views, Messages, Images are sorted from highest number to lowest number
*/
https.get("https://joinery.nyc/api/v1/listings/available", function(res){
    var body = '';
    res.on('data', function(chunk){
        body += chunk;
    });
    res.on('end', function(){
        var listings = JSON.parse(body);
        priority(listings)
    });
}).on('error', function(e){
        console.log("Got an error: ", e);
    });
function priority(matched){
    for (var i in matched){
            if (matched[i]['price'] >= S_minPrice && matched[i]['price'] <= S_maxPrice && matched[i]['parent_neighborhood']['id'] == 11 && matched[i]['listing_type_text'] == "Share"){
                L_ID = matched[i]['id'];
                L_priceDiffs = matched[i]['price'] - S_minPrice;
                L_views = matched[i]['views'];
                L_messages = matched[i]['messages'];
                L_images = matched[i]['images'];
                priceDiffs[L_ID] = L_priceDiffs;
                views[L_ID] = L_views;
                messages[L_ID] = L_messages;
                images[L_ID] = L_images;
            }
        };
        //Sorts all the lists. Only gives back ids
        sortpriceDiff = sorter(priceDiffs);
        sortviews = sorter(views, true);
        sortimages = sorter(images, true);
        sortmessages = sorter(messages, true);
        //Makes ID
        for (var i in matched){
            if (matched[i]['price'] >= S_minPrice && matched[i]['price'] <= S_maxPrice && matched[i]['parent_neighborhood']['id'] == 11 && matched[i]['listing_type_text'] == "Share"){
                L_ID = matched[i]['id'];
                scoring[L_ID] = score(L_ID);
            }
        }
        ranking = Object.keys(scoring).sort(function(a, b) {return (scoring[a] - scoring[b])});
        console.log(scoring);
        for (var i in ranking){
            for (var j in matched){
                if (matched[j]['id'].toString() == ranking[i].toString()){
                    actualRanking.push(matched[j]);
                }
            }
        }
        for (var i = 0; i < 7; i++){
            console.log("ID: "+actualRanking[i]['id']);
            console.log("Title: "+actualRanking[i]['title']);
            console.log("Address: "+actualRanking[i]['full_address']);
            console.log("Price: "+actualRanking[i]['price']);
            console.log("Views: "+actualRanking[i]['views']);
            console.log("Messages: "+actualRanking[i]['messages']);
            console.log("Images: "+actualRanking[i]['images']);
            console.log("");
        }
}
function sorter(list, rev){
    if (rev){
        return (Object.keys(list).sort(function(a, b) {return (list[a] - list[b])})).reverse();
    } else{
        return Object.keys(list).sort(function(a, b) {return (list[a] - list[b])});
    }
}
function score(id){
    id = id.toString();
    var val1 = sortpriceDiff.indexOf(id);
    var val2 = sortviews.indexOf(id);
    var val3 = sortimages.indexOf(id);
    var val4 = sortmessages.indexOf(id);
    total = val1 + val2 + val3 + val4;
    return total
}