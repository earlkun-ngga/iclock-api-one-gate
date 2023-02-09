const express = require('express');
const fs = require('fs');
var ObjectIDRes = require("bson-objectid");
const semver = require('semver');
const router = express.Router();
const apis = require('../services/devices');
const worker = require('../services/workers');
const workerModel = require('../model/worker');
const locationModel = require('../model/location');
const departure = require('../services/departures');
const departureModel = require('../model/departure');
const departureDetailModel = require('../model/departure_detail');
const departureHistoryModel = require('../model/departure_history');
const departureHistoryDetailModel = require('../model/departure_history_detail');
const company = require('../model/company');
const card = require('../model/card');
const device = require('../services/devices');
const permission = require('../services/permission_workers');
const server_config = require('../component/config');
const departures = require('../model/departure');
const command = require('../model/command');
const cardModel = require('../model/card');
const deviceModel = require('../model/device');
const logDepartureModel = require('../model/log_departure');
const dtgenerator = require('../utilities/dtgenerator');
var moment = require('moment');
var fakePeople = require('fake-people');
const mongoose = require('mongoose');

function getDaysInMonth(month, year) {
    month--; // lets fix the month once, here and be done with it
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {

        // Exclude weekends
        var tmpDate = new Date(date);            
        var weekDay = tmpDate.getDay(); // week day
        var day = tmpDate.getDate(); // day

        if (weekDay != 0) { // exclude 0=Sunday and 6=Saturday
            days.push(day);
        }

        date.setDate(date.getDate() + 1);
    }

    return days;
}  


function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

async function storeDummyCard()
{
    var maxLoop = 20000;
    var typeCard = ['EM Card', 'Mifare'];
    var workerData = await workerModel.find();

    for(var i = 0; i < maxLoop; i++)
    {   
        var dataCard = new card({
            card_type: typeCard[getRandomArbitrary(0,2)],
            card_number: getRandomArbitrary(11111111,99999999),
            worker_id: (workerData[i]) ? workerData[i]._id : null,
            updated_at: moment().format('YYYY-MM-DD hh:mm:ss'),
            created_at: moment().format('YYYY-MM-DD hh:mm:ss'),
            start_use_date: '2022-12-16',
            expired_date: '2024-12-16',
            status: '01'
        });

        if (!dataCard.save()) {
            return false;
        }
        console.log(`STORE DATA CARD ${i}/${maxLoop}`);
    }


    // return 'OK';
}



async function storeDummyDepartureHistory()
{
    
    var counter = 1;
    var workers = await workerModel.find();
    var maxLoop = 15005;

    for(var k = 0; k < maxLoop; k++) {
    
    var companyWorker = await company.findOne({_id: mongoose.Types.ObjectId(workers[k].comp_id)});
    var cardWorker = await card.findOne({worker_id: mongoose.Types.ObjectId(workers[k]._id)});

    //fetch data date in month except sunday
    var dateInJanuary2022 = getDaysInMonth(11, 2022);

    for(var i = 0; i < dateInJanuary2022.length; i++)
    {
        var dateString = String(dateInJanuary2022[i]);
        if(dateString.length == 1)
        {
            //add zero if date is one digit
            var newDateString = '0'+dateString;
        } else {
            var newDateString = dateString;
        }
        

        var inHourRand = ['08','09','10','11'];
        var outHourRand = ['17','18','19','20','21','22','23'];

        var monthHistory = '11';
        var yearHistory = '2022';

        var inGlobalTime = `${yearHistory}-${monthHistory}-${newDateString} ${inHourRand[(getRandomArbitrary(0,3))]}:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`;
        var exitGlobalTime = `${yearHistory}-${monthHistory}-${newDateString} ${outHourRand[(getRandomArbitrary(0,3))]}:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`;

        //parent 
        var data0 = new departureHistoryModel({
            worker_id: mongoose.Types.ObjectId(workers[k]['_id']),
            worker_name: workers[k]['name'],
            worker_id_number: workers[k]['id_number'],
            worker_type: workers[k]['type'],
            comp_id: mongoose.Types.ObjectId(workers[k]['comp_id']),
            company_name: companyWorker.name,
            device_sn_in: 'CJ75193260004',
            device_id_sn_in: mongoose.Types.ObjectId('631842da412734a4b3621183'),
            device_sn_out: 'CJ75193260005',
            device_id_sn_out: mongoose.Types.ObjectId('634d0b8f03f38394778dcccc'),
            verify_type: '01',
            location_id: mongoose.Types.ObjectId('632d2ed8636b0000f00041b7'),
            location_name: 'Kolink Area 1',
            card_id: mongoose.Types.ObjectId(cardWorker._id),
            card_number: cardWorker.card_number, 
            in_time: inGlobalTime,
            out_time: exitGlobalTime,
            status: '01',
            company_short_name: companyWorker.short_name,
            created_at: exitGlobalTime,
            updated_at: exitGlobalTime
        });
        // data0.save(); 
        try {
            await data0.save(function(err, dt)
            {

                //detail 1
                var data_detail1 = new departureHistoryDetailModel({
                    departure_today_id: mongoose.Types.ObjectId(dt._id),
                    worker_id: mongoose.Types.ObjectId(workers[k]['_id']),
                    worker_name: workers[k]['name'],
                    worker_id_number: workers[k]['id_number'],
                    worker_type: workers[k]['type'],
                    comp_id: mongoose.Types.ObjectId(workers[k]['comp_id']),
                    company_name: companyWorker.name,
                    device_sn_in: 'CJ75193260004',
                    device_id_sn_in: mongoose.Types.ObjectId('631842da412734a4b3621183'),
                    device_sn_out: 'CJ75193260005',
                    device_id_sn_out: mongoose.Types.ObjectId('634d0b8f03f38394778dcccc'),
                    verify_type: '01',
                    location_id: mongoose.Types.ObjectId('632d2ed8636b0000f00041b7'),
                    location_name: 'Kolink Area 1',
                    card_id: mongoose.Types.ObjectId(cardWorker._id),
                    card_number: cardWorker.card_number, 
                    in_time: inGlobalTime,
                    out_time: `${yearHistory}-${monthHistory}-${newDateString} 12:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    status: '01',
                    company_short_name: companyWorker.short_name,
                    created_at: `${yearHistory}-${monthHistory}-${newDateString} 12:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    updated_at: `${yearHistory}-${monthHistory}-${newDateString} 12:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`
                });
                //detail 2
                var data_detail2 = new departureHistoryDetailModel({
                    departure_today_id: mongoose.Types.ObjectId(dt._id),
                    worker_id: mongoose.Types.ObjectId(workers[k]['_id']),
                    worker_name: workers[k]['name'],
                    worker_id_number: workers[k]['id_number'],
                    worker_type: workers[k]['type'],
                    comp_id: mongoose.Types.ObjectId(workers[k]['comp_id']),
                    company_name: companyWorker.name,
                    device_sn_in: 'CJ75193260004',
                    device_id_sn_in: mongoose.Types.ObjectId('631842da412734a4b3621183'),
                    device_sn_out: 'CJ75193260005',
                    device_id_sn_out: mongoose.Types.ObjectId('634d0b8f03f38394778dcccc'),
                    verify_type: '01',
                    location_id: mongoose.Types.ObjectId('632d2ed8636b0000f00041b7'),
                    location_name: 'Kolink Area 1',
                    card_id: mongoose.Types.ObjectId(cardWorker._id),
                    card_number: cardWorker.card_number, 
                    in_time: `${yearHistory}-${monthHistory}-${newDateString} 13:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    out_time: `${yearHistory}-${monthHistory}-${newDateString} 14:${getRandomArbitrary(10,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    status: '01',
                    company_short_name: companyWorker.short_name,
                    created_at: `${yearHistory}-${monthHistory}-${newDateString} 15:${getRandomArbitrary(35,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    updated_at: `${yearHistory}-${monthHistory}-${newDateString} 15:${getRandomArbitrary(35,55)}:${getRandomArbitrary(10,55)}+00:00`
                });

                //detail 3
                var data_detail3 = new departureHistoryDetailModel({
                    departure_today_id: mongoose.Types.ObjectId(dt._id),
                    worker_id: mongoose.Types.ObjectId(workers[k]['_id']),
                    worker_name: workers[k]['name'],
                    worker_id_number: workers[k]['id_number'],
                    worker_type: workers[k]['type'],
                    comp_id: mongoose.Types.ObjectId(workers[k]['comp_id']),
                    company_name: companyWorker.name,
                    device_sn_in: 'CJ75193260004',
                    device_id_sn_in: mongoose.Types.ObjectId('631842da412734a4b3621183'),
                    device_sn_out: 'CJ75193260005',
                    device_id_sn_out: mongoose.Types.ObjectId('634d0b8f03f38394778dcccc'),
                    verify_type: '01',
                    location_id: mongoose.Types.ObjectId('632d2ed8636b0000f00041b7'),
                    location_name: 'Kolink Area 1',
                    card_id: mongoose.Types.ObjectId(cardWorker._id),
                    card_number: cardWorker.card_number, 
                    in_time: `${yearHistory}-${monthHistory}-${newDateString} 15:10:${getRandomArbitrary(10,55)}+00:00`,
                    out_time: `${yearHistory}-${monthHistory}-${newDateString} 15:${getRandomArbitrary(35,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    status: '01',
                    company_short_name: companyWorker.short_name,
                    created_at: `${yearHistory}-${monthHistory}-${newDateString} 15:${getRandomArbitrary(35,55)}:${getRandomArbitrary(10,55)}+00:00`,
                    updated_at: `${yearHistory}-${monthHistory}-${newDateString} 15:${getRandomArbitrary(35,55)}:${getRandomArbitrary(10,55)}+00:00`
                });

                //detail 4
                var data_detail4 = new departureHistoryDetailModel({
                    departure_today_id: mongoose.Types.ObjectId(dt._id),
                    worker_id: mongoose.Types.ObjectId(workers[k]['_id']),
                    worker_name: workers[k]['name'],
                    worker_id_number: workers[k]['id_number'],
                    worker_type: workers[k]['type'],
                    comp_id: mongoose.Types.ObjectId(workers[k]['comp_id']),
                    company_name: companyWorker.name,
                    device_sn_in: 'CJ75193260004',
                    device_id_sn_in: mongoose.Types.ObjectId('631842da412734a4b3621183'),
                    device_sn_out: 'CJ75193260005',
                    device_id_sn_out: mongoose.Types.ObjectId('634d0b8f03f38394778dcccc'),
                    verify_type: '01',
                    location_id: mongoose.Types.ObjectId('632d2ed8636b0000f00041b7'),
                    location_name: 'Kolink Area 1',
                    card_id: mongoose.Types.ObjectId(cardWorker._id),
                    card_number: cardWorker.card_number, 
                    in_time: `${yearHistory}-${monthHistory}-${newDateString} 16:10:${getRandomArbitrary(10,55)}+00:00`,
                    out_time: exitGlobalTime,
                    status: '01',
                    company_short_name: companyWorker.short_name,
                    created_at: exitGlobalTime,
                    updated_at: exitGlobalTime
                });
    
                // data_detail1.save();
                data_detail1.save();
                data_detail2.save();
                data_detail3.save();
                data_detail4.save();
            })
        } catch(err) {
            console.log(err);
        }
    }
    console.log(`SEEDING UNTUK HISTORY WORKER KE ${k}/${maxLoop}`);
    counter++;
    }
}



module.exports = {
    storeDummyCard,
    storeDummyDepartureHistory
};
