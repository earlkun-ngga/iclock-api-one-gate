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
const dummy = require('../utilities/dummy');

//For Access Permission (IF 0 Cant Store, IF 1 Store)
var canPush = '0';

//FUNCTION



function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}



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




function PushPayloadParser(data) {
    var ret = [];
    data.trim().split('\r\n').forEach(element => {
        const temp = {};
        element.split('\t').forEach(x => {
            temp[x.split('=')[0]] = x.split('=')[1];
        });
        ret.push(temp);
    });

    return ret;
}




/* Dummy Data Generator */

router.get('/getlastid', async function(req, res, next){
    var workerFind = await workerModel.count();
    var nextId = workerFind+1;
    var stringNextId = String(nextId);
    
    if(stringNextId.length == 1)
    {
        var finalId = "00000000"+stringNextId;
    } else if(stringNextId.length == 2) {
        var finalId = "0000000"+stringNextId;
    } else if(stringNextId.length == 3) {
        var finalId = "000000"+stringNextId;
    } else if(stringNextId.length == 4) {
        var finalId = "00000"+stringNextId;
    } else if(stringNextId.length == 5) {
        var finalId = "0000"+stringNextId;
    } else if(stringNextId.length == 6) {
        var finalId = "000"+stringNextId;
    } else if(stringNextId.length == 7) {
        var finalId = "00"+stringNextId;
    } else if(stringNextId.length == 8) {
        var finalId = "0"+stringNextId;
    } else if(stringNextId.length == 9) {
        var finalId = stringNextId;
    }


    res.send(`OK! ${finalId}`);
});

router.get('/dummydeparturehistory', async function(req, res, next){
    await dummy.storeDummyDepartureHistory();
    res.send('OK!');
});

router.get('/testidget', async function(req, res, next){
    
    var workerFind = await workerModel.find().sort({id_number : -1}).limit(1);
    var intId = parseInt(workerFind[0]['id_number'])+1;
    var stringId = String(intId);
    console.log(stringId);
    res.send('OK!');

});

router.get('/dummydataworker', async function(req, res, next) {

    var peoples = fakePeople.generate(20000,['firstName','lastName']);
    var val = 8;
    var dataDevice = await device.GetAllDevice();
    var i = 0;
    var id_number_dummy = 10000010;
    
    //give all access for all locations
    var locations = [];
    var location = await locationModel.find();
    var companies_id = [
        '63071c4b079214c1ac0ae9d3', 
        '63071c6b079214c1ac0ae9d4', 
        '630dceb3eb070000bb003850', 
        '630dcf7deb070000bb003851', 
        '630dcfc8eb070000bb003852', 
        '633b8e17e7620000df000a89'];

    location.forEach(element=>{
        locations.push(element['_id']);
    });
    
    peoples.forEach(element => {
        console.log(`${element['firstName']} ${element['lastName']}`);
        var dataWorkerNew = new workerModel({
            uid: val,
            nat_id: "id",
            comp_id: mongoose.Types.ObjectId(companies_id[getRandomArbitrary(0,5)]),
            pos_id: "01",
            id_number: String(id_number_dummy),
            name: element['firstName'] + ' ' + element['lastName'],
            created_at: moment().format('YYYY-MM-DD hh:mm:ss'),
            permission_loc_Ids: locations
        });
        if (!dataWorkerNew.save()) {
            return false;
        }
        console.log(val);
        console.log(getRandomArbitrary(0,4));
        console.log(`SEEDING DATA WORKER  ${i}/15000`);
        val++;
        i++;
        id_number_dummy++;
    });
    res.send('OK');
});

router.get('/dummydatacard', async function(req, res, next) {

    await dummy.storeDummyCard();
    
    res.send('OK');

});

/* GET device listing. */
router.get('/test', async function(req, res, next) {
    try {
        var today = moment().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        var tommorow = moment(today).add(1, 'days');
        console.log(today.toISOString(), tommorow.toISOString());
        const absent = await departures.findOne({
            in_time: {
                $gte: new Date(today.toISOString()),
                $lt: new Date(tommorow.toISOString())
            }
        });
        console.log(absent);
        res.send(absent);
    } catch (err) {
        console.error(err.message);
        res.send('Ok');
    }
});

/* GET device listing. */
router.get('/cdata', async function(req, res, next) {
    try {
        console.log(req.query);
        // get parameter from url
        var serial_number = req.query.SN;
        // var push_version = req.query.pushver;
        // var options = req.query.options;
        // var push_options_flag = req.query.PushOptionsFlag;
        // var pushProtVer = semver.valid(server_config.server.protocol_version);
        // if (pushProtVer == null)
        //     throw new Error('Server Protocol version is not valid');
        // // valid check client protocol version
        // push_version = semver.valid(push_version);
        // if (push_version == null)
        //     throw new Error('Client Protocol version is not valid');
        // // compare version
        // if (!semver.satisfies(push_version, '=' + pushProtVer)) {
        //     console.log(push_version, '=' + pushProtVer);
        //     throw new Error('Not Match client and server protocol version');
        // }
        // // compare options
        // if (options != 'all')
        //     throw new Error('API permit is not allow');
        // if (push_options_flag != 1)
        //     throw new Error('Device push is disabled');
        var data = await apis.GetDeviceInfoFromAuth(null, serial_number);
        console.log(data);
        res.send(data);
    } catch (err) {
        console.error(err.message);
        // res.send('Ok');
    }
});

router.post('/exchange', async function(req, res, next) {
    try {
        console.log('EXCHANGE');
    } catch (err) {
        console.error(err.message);
        next('OK');
    }
});

router.post('/cdata', async function(req, res, next) {
    try {
        console.log('POST CDATA');
        console.log('path=' + req._parsedUrl.query);
        var queries = req.query;
        var data = req.body;
        if(req.query.isve){
            var dataObject = [];
            dataObject[0] = data;
        } else {
            var dataObject = PushPayloadParser(data);
        }
        var response;
        var dataDevice = await deviceModel.findOne({serial_number: queries['SN']});
        var dataLocation = await locationModel.findOne({_id:mongoose.Types.ObjectId(dataDevice.location_id)});



        if (queries.AuthType) {
            if(queries.AuthType != 'CARD') {
                //FOR LOG
                var timeLog = dataObject[0]['time'];
                var splitTimeLog = timeLog.split(' ');
                splitTimeLog[0] = splitTimeLog[0] + 'T';
                splitTimeLog[1] = splitTimeLog[1] + '.000+00:00';
                //AUTH USE FACE
                var pmcode = await workerModel.findOne({
                    uid: dataObject[0]['pin'],
                    deleted_at: {$exists: false}
                });

                var condition = {
                    'worker_id' : mongoose.Types.ObjectId(pmcode._id)
                };
                var testDuplicate = await departureDetailModel.findOne(condition).sort({_id:-1});
            // VALIDATION IN OUT
            if(dataObject[0]['inoutstatus'] == '0') {
                //IF IN
                console.log('[IN DETECTION]');
                    if(testDuplicate && testDuplicate['out_time'] == null) {
                        console.log('[FAILED] -> user is already in, must be logged out.');
                        // LOG
                        var logDepart = new logDepartureModel({
                            worker_id: mongoose.Types.ObjectId(pmcode._id),
                            worker_name: pmcode.name,
                            device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                            device_sn: queries.SN,
                            status: '04',
                            inout_type: dataObject[0]['inoutstatus'],
                            detail: 'BLOCK BY DUPLICATE (IN)',
                            time: splitTimeLog[0] + splitTimeLog[1],
                            location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                            location_name: dataLocation.name,
                            verify_type: 'Face'
                        });

                        if(!logDepart.save()) {
                            return false;
                        }
                        //Response For Device IF Failed
                        response = "AUTH=FAILED";
                    } else {
                    console.log('[SUCCESS] -> User IN');
                    if(pmcode['status'] == '01') {
                        //IF STATUS USER ENABLED    
                        //PERMISSION LOCATION
                        try {
                            var dataDevice =  await deviceModel.findOne({serial_number: queries['SN']});
                            var dataWorker = await workerModel.find({
                                    _id: mongoose.Types.ObjectId(pmcode._id),
                                    permission_loc_Ids: {$in: [ObjectIDRes(dataDevice.location_id)]},
                            });
                            if(dataWorker != '') {
                                //IF PERMISSION APPROVED

                                var logDepart = await new logDepartureModel({
                                    worker_id: mongoose.Types.ObjectId(pmcode._id),
                                    worker_name: pmcode.name,
                                    device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                    device_sn: queries.SN,
                                    status: '03',
                                    inout_type: dataObject[0]['inoutstatus'],
                                    detail: 'SUCCESS ACCESS',
                                    time: splitTimeLog[0] + splitTimeLog[1],
                                    location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                    location_name: dataLocation.name,
                                    verify_type: 'Face'
                                });
                                if(!logDepart.save()) {
                                    return false;
                                }
                                //Response for Device
                                canPush = '1';
                                response = "AUTH=SUCCESS";
                            } else {
                                //IF PERMISSION DENIED

                                var logDepart = new logDepartureModel({
                                    worker_id: mongoose.Types.ObjectId(pmcode._id),
                                    worker_name: pmcode.name,
                                    device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                    device_sn: queries.SN,
                                    status: '02',
                                    inout_type: dataObject[0]['inoutstatus'],
                                    detail: 'BLOCK BY PERMISSION LOCATION',
                                    time: splitTimeLog[0] + splitTimeLog[1],
                                    location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                    location_name: dataLocation.name,
                                    verify_type: 'Face'
                                });

                                if(!logDepart.save()) {
                                    return false;
                                }
                                console.log('[FAILED] -> the user does not have location access.');
                                response = "AUTH=FAILED";
                            }
                        } catch(err) {
                            console.log('[FAILED] -> ' + err);
                            response = "AUTH=FAILED";
                        }        
                    } else {
                        //IF STATUS USER DISABLED
                        var logDepart = new logDepartureModel({
                            worker_id: mongoose.Types.ObjectId(pmcode._id),
                            worker_name: pmcode.name,
                            device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                            device_sn: queries.SN,
                            status: '01',
                            inout_type: dataObject[0]['inoutstatus'],
                            detail: 'BLOCK BY PERMISSION ACCESS',
                            time: splitTimeLog[0] + splitTimeLog[1],
                            location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                            location_name: dataLocation.name,
                            verify_type: 'Face'
                        });

                        if(!logDepart.save())
                        {
                            return false;
                        }
                        console.log('[FAILED] -> status user is Disabled.');
                        response = "AUTH=FAILED";
                    }  
                    }
            } else {
                console.log('[OUT DETECTION]');
                if(testDuplicate && testDuplicate['out_time'] != null || testDuplicate == null)
                {
                    console.log('[FAILED] -> The user must log in first, then can log out');

                    //LOG
                    var logDepart = new logDepartureModel({
                        worker_id: mongoose.Types.ObjectId(pmcode._id),
                        worker_name: pmcode.name,
                        device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                        device_sn: queries.SN,
                        status: '04',
                        inout_type: dataObject[0]['inoutstatus'],
                        detail: 'BLOCK BY DUPLICATE (OUT)',
                        time: splitTimeLog[0] + splitTimeLog[1],
                        location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                        location_name: dataLocation.name,
                        verify_type: 'Face'
                    });
                    if(!logDepart.save()) {
                        return false;
                    }
                    //RESPONSE FOR DEVICE
                    response = "AUTH=FAILED";
                } else {
                    console.log('[SUCCESS] -> User Out');
                    if(pmcode['status'] == '01') {    
                        //PERMISSION LOCATION
                        try {
                            var dataDevice =  await deviceModel.findOne({serial_number: queries['SN']});
                            var dataWorker = await workerModel.find({
                                    _id: mongoose.Types.ObjectId(pmcode._id),
                                    permission_loc_Ids: {$in: [ObjectIDRes(dataDevice.location_id)]},
                            });
                            if(dataWorker != '') {
                                //IF PERMISSION APPROVED
                                var logDepart = await new logDepartureModel({
                                    worker_id: mongoose.Types.ObjectId(pmcode._id),
                                    worker_name: pmcode.name,
                                    device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                    device_sn: queries.SN,
                                    status: '03',
                                    inout_type: dataObject[0]['inoutstatus'],
                                    detail: 'SUCCESS ACCESS',
                                    time: splitTimeLog[0] + splitTimeLog[1],
                                    location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                    location_name: dataLocation.name,
                                    verify_type: 'Face'
                                });
                                if(!logDepart.save()) {
                                    return false;
                                }
                                canPush = '1';
                                response = "AUTH=SUCCESS";
                            } else {
                                //IF PERMISSION DENIED
                                var logDepart = new logDepartureModel({
                                    worker_id: mongoose.Types.ObjectId(pmcode._id),
                                    worker_name: pmcode.name,
                                    device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                    device_sn: queries.SN,
                                    status: '02',
                                    inout_type: dataObject[0]['inoutstatus'],
                                    detail: 'BLOCK BY PERMISSION LOCATION',
                                    time: splitTimeLog[0] + splitTimeLog[1],
                                    location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                    location_name: dataLocation.name,
                                    verify_type: 'Face'
                                });
                                if(!logDepart.save()) {
                                    return false;
                                }
                                console.log('[FAILED] -> the user does not have location access.');
                                response = "AUTH=FAILED";
                            }
                        } catch(err) {
                            console.log('[FAILED] -> '+err);
                            response = "AUTH=FAILED";
                        }        
                    } else {
                        //USER IS DISABLED
                        var logDepart = new logDepartureModel({
                            worker_id: mongoose.Types.ObjectId(pmcode._id),
                            worker_name: pmcode.name,
                            device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                            device_sn: queries.SN,
                            status: '01',
                            inout_type: dataObject[0]['inoutstatus'],
                            detail: 'BLOCK BY PERMISSION ACCESS',
                            time: splitTimeLog[0] + splitTimeLog[1],
                            location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                            location_name: dataLocation.name,
                            verify_type: 'Face'
                        });
                        if(!logDepart.save())
                        {
                            return false;
                        }
                        console.log('[FAILED] -> status user is Disabled.');
                        response = "AUTH=FAILED";
                    } 
                }
            }
            } else {
                //FOR LOG
                var timeLog = dataObject[0]['time'];
                var splitTimeLog = timeLog.split(' ');
                splitTimeLog[0] = splitTimeLog[0] + 'T';
                splitTimeLog[1] = splitTimeLog[1] + '.000+00:00';
                //USE AUTH WITH CARD

                var pmcode = await workerModel.findOne({
                    uid: dataObject[0]['pin'],
                    deleted_at: {$exists: false}
                });

                //VALUE FOR LOG
                var inoutStatus;

                if(dataObject[0]['inoutstatus'] == '1')
                {
                    inoutStatus = '0';
                } else {
                    inoutStatus = '1';
                }
                
                var testDuplicate = await departureDetailModel.findOne({
                    worker_id: mongoose.Types.ObjectId(pmcode['_id'])
                }).sort({_id:-1});
                
                //VALIDATION IN OUT
                if(dataObject[0]['inoutstatus'] == '1') {
                    console.log('[IN DETECTION]');
                        if(testDuplicate && testDuplicate['out_time'] == null)
                        {
                            console.log('[FAILED] -> user is already in, must be logged out.');
                            //LOG
                            var logDepart = new logDepartureModel({
                                worker_id: mongoose.Types.ObjectId(pmcode._id),
                                worker_name: pmcode.name,
                                device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                device_sn: queries.SN,
                                status: '04',
                                inout_type: inoutStatus,
                                detail: 'BLOCK BY CARD DUPLICATE (IN)',
                                time: splitTimeLog[0] + splitTimeLog[1],
                                location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                location_name: dataLocation.name,
                                verify_type: 'Card'
                            });
                            if(!logDepart.save()) {
                                return false;
                            }
                            //Response For Device IF Failed
                            response = "AUTH=FAILED";
                        } else {
                        console.log('[SUCCESS] -> User IN');
                        //REAL
                        if(pmcode['status'] == '01') {
                            //IF STATUS USER ENABLED      
                            //PERMISSION LOCATION
                            try {
                                var dataDevice =  await deviceModel.findOne({serial_number: queries['SN']});
                                var dataWorker = await workerModel.find({
                                        _id: mongoose.Types.ObjectId(pmcode._id),
                                        permission_loc_Ids: {$in: [ObjectIDRes(dataDevice.location_id)]}
                                });
                                if(dataWorker != '') {
                                    //VALIDASI CARD ACTIVE OR NOT
                                    var dataCard = await cardModel.findOne({worker_id: mongoose.Types.ObjectId(pmcode._id)});
                                    if(dataCard['status'] == "01") {
                                        console.log('TODAY DATE : ' + moment().format('YYYY-MM-DD'));
                                        if(dataCard['expired_date'] > moment().format('YYYY-MM-DD'))
                                        {
                                            var logDepart = await new logDepartureModel({
                                                worker_id: mongoose.Types.ObjectId(pmcode._id),
                                                worker_name: pmcode.name,
                                                device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                                device_sn: queries.SN,
                                                status: '03',
                                                inout_type: inoutStatus,
                                                detail: 'SUCCESS ACCESS CARD',
                                                time: splitTimeLog[0] + splitTimeLog[1],
                                                location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                                location_name: dataLocation.name,
                                                verify_type: 'Card'
                                            });
                                            if(!logDepart.save())
                                            {
                                                return false;
                                            }
                                            //Response for Device
                                            console.log("[SUCCESS] -> Card IS Expired");
                                            canPush = '1';
                                            response = "AUTH=SUCCESS";
                                        } else {
                                            var logDepart = new logDepartureModel({
                                                worker_id: mongoose.Types.ObjectId(pmcode._id),
                                                worker_name: pmcode.name,
                                                device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                                device_sn: queries.SN,
                                                status: '02',
                                                inout_type: inoutStatus,
                                                detail: 'BLOCK BY EXPIRED CARD',
                                                time: splitTimeLog[0] + splitTimeLog[1],
                                                location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                                location_name: dataLocation.name,
                                                verify_type: 'Card'
                                            });
                                            if(!logDepart.save())
                                            {
                                                return false;
                                            }
                                            console.log("[FAILED] -> Card Not Active");
                                            response = "AUTH=FAILED";
                                        }

                                    } else { 
                                        //IF CARD NOT ACTIVE
                                        var logDepart = new logDepartureModel({
                                            worker_id: mongoose.Types.ObjectId(pmcode._id),
                                            worker_name: pmcode.name,
                                            device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                            device_sn: queries.SN,
                                            status: '02',
                                            inout_type: inoutStatus,
                                            detail: 'BLOCK BY UNACTIVE CARD',
                                            time: splitTimeLog[0] + splitTimeLog[1],
                                            location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                            location_name: dataLocation.name,
                                            verify_type: 'Card'
                                        });
                                        if(!logDepart.save())
                                        {
                                            return false;
                                        }
                                        console.log("[FAILED] -> Card Not Active");
                                        response = "AUTH=FAILED";
                                    }
                                } else {

 
                                    var logDepart = new logDepartureModel({
                                        worker_id: mongoose.Types.ObjectId(pmcode._id),
                                        worker_name: pmcode.name,
                                        device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                        device_sn: queries.SN,
                                        status: '02',
                                        inout_type: inoutStatus,
                                        detail: 'BLOCK BY CARD PERMISSION LOCATION',
                                        time: splitTimeLog[0] + splitTimeLog[1],
                                        location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                        location_name: dataLocation.name,
                                        verify_type: 'Card'
                                    });
                                    if(!logDepart.save())
                                    {
                                        return false;
                                    }
                                    console.log('[FAILED] -> the user does not have location access.');
                                    response = "AUTH=FAILED";
                                }
                            } catch(err) {
                                console.log('[FAILED] -> ' + err);
                                response = "AUTH=FAILED";
                            }        
                        } else {

                            var logDepart = new logDepartureModel({
                                worker_id: mongoose.Types.ObjectId(pmcode._id),
                                worker_name: pmcode.name,
                                device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                device_sn: queries.SN,
                                status: '01',
                                inout_type: inoutStatus,
                                detail: 'BLOCK BY CARD PERMISSION ACCESS',
                                time: splitTimeLog[0] + splitTimeLog[1],
                                location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                location_name: dataLocation.name,
                                verify_type: 'Card'
                            });
                            if(!logDepart.save())
                            {
                                return false;
                            }
                            console.log('[FAILED] -> status user is Disabled.');
                            response = "AUTH=FAILED";
                        }  
                        }
                } else {
                    console.log('[OUT DETECTION]');
                    if( testDuplicate &&  testDuplicate['out_time'] != null  || testDuplicate == null)
                    {
                        console.log('[FAILED] -> The user must log in first, then can log out');
                        var logDepart = new logDepartureModel({
                            worker_id: mongoose.Types.ObjectId(pmcode._id),
                            worker_name: pmcode.name,
                            device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                            device_sn: queries.SN,
                            status: '04',
                            inout_type: inoutStatus,
                            detail: 'BLOCK BY CARD DUPLICATE (OUT)',
                            time: splitTimeLog[0] + splitTimeLog[1],
                            location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                            location_name: dataLocation.name,
                            verify_type: 'Card'
                        });
                        if(!logDepart.save()) {
                            return false;
                        }
                        //RESPONSE FOR DEVICE
                        response = "AUTH=FAILED";
                    } else {
                        console.log('[SUCCESS] -> User Out');
                        if(pmcode['status'] == '01') {    
                            //PERMISSION LOCATION
                            try {
                                var dataDevice =  await deviceModel.findOne({serial_number: queries['SN']});
                                var dataWorker = await workerModel.find({
                                        _id: mongoose.Types.ObjectId(pmcode._id),
                                        permission_loc_Ids: {$in: [ObjectIDRes(dataDevice.location_id)]}
                                });
                                if(dataWorker != '') {
                                    //IF PERMISSION APPROVED

                                    var logDepart = await new logDepartureModel({
                                        worker_id: mongoose.Types.ObjectId(pmcode._id),
                                        worker_name: pmcode.name,
                                        device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                        device_sn: queries.SN,
                                        status: '03',
                                        inout_type: inoutStatus,
                                        detail: 'SUCCESS ACCESS BY CARD',
                                        time: splitTimeLog[0] + splitTimeLog[1],
                                        location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                        location_name: dataLocation.name,
                                        verify_type: 'Card'
                                    });
                                    if(!logDepart.save()) {
                                        return false;
                                    }
                                    canPush = '1';
                                    response = "AUTH=SUCCESS";
                                } else {
                                    //IF PERMISSION DENIED

                                    var logDepart = new logDepartureModel({
                                        worker_id: mongoose.Types.ObjectId(pmcode._id),
                                        worker_name: pmcode.name,
                                        device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                        device_sn: queries.SN,
                                        status: '02',
                                        inout_type: inoutStatus,
                                        detail: 'BLOCK BY CARD PERMISSION LOCATION',
                                        time: splitTimeLog[0] + splitTimeLog[1],
                                        location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                        location_name: dataLocation.name,
                                        verify_type: 'Card'
                                    });
                                    if(!logDepart.save()) {
                                        return false;
                                    }
                                    console.log('[FAILED] -> the user does not have location access.');
                                    response = "AUTH=FAILED";
                                }
                            } catch(err) {
                                console.log('[FAILED] -> '+err);
                                response = "AUTH=FAILED";
                            }        
                        } else {
                            //USER IS DISABLED

                            var logDepart = new logDepartureModel({
                                worker_id: mongoose.Types.ObjectId(pmcode._id),
                                worker_name: pmcode.name,
                                device_sn_id: mongoose.Types.ObjectId(dataDevice._id),
                                device_sn: queries.SN,
                                status: '01',
                                inout_type: inoutStatus,
                                detail: 'BLOCK BY CARD PERMISSION ACCESS',
                                time: splitTimeLog[0] + splitTimeLog[1],
                                location_id: mongoose.Types.ObjectId(dataDevice.location_id),
                                location_name: dataLocation.name,
                                verify_type: 'Card'
                            });
                            if(!logDepart.save())
                            {
                                return false;
                            }
                            console.log('[FAILED] -> status user is Disabled.');
                            response = "AUTH=FAILED";
                        } 
                    }
                }
            }
        } else {
            var dataDeviceCmd = await device.GetAllDevice();
            
            switch (queries.table) {
                case "rtstate":
                    console.log(data);
                    console.log('rtstate');
                    response = 'OK';
                    break;
                case "tabledata":
                    if (queries.tablename == 'biophoto') {
                        console.log('biodata ++');
                        console.log(data);
                        console.log(res.body);
                        
                        var dataPayload = PushPayloadParser(data);
                        let buff = Buffer.from(dataPayload[0]['content'], 'base64');
                        fs.writeFileSync('output.jpg', buff);
                        var base64img = fs.readFileSync('output.jpg','base64');
                        var store = await worker.storeOnlyPhoto(queries, data, base64img);
                        console.log(store);
                        
                        for(var i=0; i<dataDeviceCmd.length; i++)
                        {
                            var dataCmd = new command({
                                command_id: '104',
                                command_type: 'DATA',
                                command_target: 'UPDATE',
                                params: `biophoto PIN=${dataPayload[0]['biophoto pin']}\tType=${dataPayload[0]['type']}\tSize=${dataPayload[0]['size']}\tContent=${base64img}\tFormat=0\tUrl=\tPostBackTmpFlag=1\r\n`,
                                serial_number: dataDeviceCmd[i].serial_number
                            });
                            if(!dataCmd.save())
                            {
                                return false;
                            }
                        }
                        response = 'OK';
                    } else if (queries.tablename == 'biodata') {
                        console.log(data);
                        response = 'OK';
                    } else if (queries.tablename == 'user') {
                        console.log('user ++');
                        console.log(data);
                        var store = worker.storeOnlyName(queries, data);
                        var dataPayload = PushPayloadParser(data);
                        for(var i = 0; i < dataDeviceCmd.length; i++)
                        {
                                var dataCmd = new command({
                                    command_id: '101',
                                    command_type: 'DATA',
                                    command_target: 'UPDATE',
                                    params: `user CardNo=\tPin=${dataPayload[0]['pin']}\tPassword=${dataPayload[0]['password']}\tGroup=${dataPayload[0]['group']}\tStartTime=0\tEndTime=0\tName=${dataPayload[0]['name']}\tPrivilege=${dataPayload[0]['privilege']}\r\n`,
                                    serial_number: dataDeviceCmd[i].serial_number
                                });
                                if(!dataCmd.save())
                                {
                                    return false;
                                }
                                var dataCmd2 = new command({
                                    command_id: '102',
                                    command_type: 'DATA',
                                    command_target: 'UPDATE',
                                    params: `userauthorize Pin=${dataPayload[0]['pin']}\tAuthorizeTimezoneId=1\tAuthorizeDoorId=1\tDevId=1\r\n`,
                                    serial_number: dataDeviceCmd[i].serial_number
                                });
                                if(!dataCmd2.save())
                                {
                                    return false;
                                }
                                if(dataPayload[0]['name'] != '') {
                                    console.log('INSERT NAMED : ' + dataPayload[0]['name']);
                                    var dataCmd3 = new command({
                                        command_id: '105',
                                        command_type: 'DATA',
                                        command_target: 'UPDATE',
                                        params: `extuser Pin=${dataPayload[0]['pin']}\tFunSwitch=1\tFirstName=${dataPayload[0]['name']}\tLastName=\tPersonalVs=255\r\n`,
                                        serial_number: dataDeviceCmd[i].serial_number
                                    });
                                    if(!dataCmd3.save())
                                    {
                                        return false;
                                    }
                                } else {
                                    console.log('IN USER REQUEST -> NAME IS NULL (DIFFERENT VERSION)');
                                }
                        }
                        response = 'OK';
                    } else if (queries.tablename == 'extuser') {
                        console.log('extuser ++');
                        console.log(data);
                        var store = await worker.store(queries, data);
                        var dataPayload = PushPayloadParser(data);
                        var dataDevice = await device.GetAllDevice();
                        for(var i = 0; i < dataDeviceCmd.length; i++)
                        {
                            var dataCmd = new command({
                                command_id: '103',
                                command_type: 'DATA',
                                command_target: 'UPDATE',
                                params: `extuser Pin=${dataPayload[0]['extuser pin']}\tFunSwitch=${dataPayload[0]['funswitch']}\tFirstName=${dataPayload[0]['firstname']}\tLastName=${dataPayload[0]['lastname']}\tPersonalVs=${dataPayload[0]['personalvs']}\r\n`,
                                serial_number: dataDeviceCmd[i].serial_number
                            });
                            if(!dataCmd.save())
                            {
                                return false;
                            }
                        }
                        response = 'OK';
                    }
                    break;
                case "rtlog":
                    console.log('log');
                    console.log(data);
                    if (queries.table != 'rtlog') {
                        console.log('fuck u');
                    } 
                    if(canPush == '1') {
                        var dataDevice =  await deviceModel.findOne({serial_number: queries['SN']});
                        var store = await departure.store(queries, data, mongoose.Types.ObjectId(dataDevice.location_id));
                        canPush = '0';
                        response = 'OK';
                    } else {
                        // return false;
                        response = 'OK';
                    }
                    break;
                case "options":
                    response = 'OK';
                    break;
                default:
                    break;
            }
        }
        console.log(response);
        res.send(response);
    } catch (err) {
        console.error('aa'+err.message);
        next(err.message);
    }
});

router.post('/registry', async function(req, res, next) {
    try {
        console.log('REGISTRY');
        const data = await apis.GetDeviceRegistryCode(null, req.query.SN);
        res.send(data);
    } catch (err) {
        console.error(err.message);
        next('OK');
    }
});


router.get('/ping', async function(req, res, next) {
    try {
        console.log('PING');
        if (await apis.SetDeviceUptimeFromAuth(null, req.query.SN)) {
            res.send('OK');
        } else {
            throw new Error('Ping Heartbeat error.');
        }
    } catch (err) {
        console.error(err.message);
        next(err.message);
    }
});


router.get('/rtdata', async function(req, res, next){
    console.log('RT DATA');
    console.log(moment().format('hh'));
    console.log(req.query);
    var valDtGenerator = dtgenerator.toUnixFormatDate();
    console.log(valDtGenerator);
    console.log(dtgenerator.generateTimeToday());
    res.send(`DateTime=${valDtGenerator},MachineTZ=+0700`);
});

router.get('/getrequest', async function(req, res, next) {

   console.log('GET REQUEST -> SN : '+ req.query.SN);
    try {
        // update heatbeat
        if ((!await apis.SetDeviceUptimeFromAuth(null, req.query.SN)))
            throw new Error('GetRequest Heartbeat error');
        res.send(await apis.GetDeviceCommandMongo(null, req.query.SN));
    } catch (err) {
        console.error(err.message);
        next(err.message);
    }
});

router.post('/devicecmd', async function(req, res, next) {
    try {
        console.log('COMMAND');
        console.log(req.body);
        if(req.query.isve)
        {
            console.log('Yes Is VE');
            console.log(req.body.ID);
            console.log(req.query.SN);
            await apis.DeleteDeviceCommandMongo(null, req.query.SN, req.body.ID);
        } else {
            console.log('No Is Real Engine');
            const arguments = await apis.CommandResultParser(req.body);
            await apis.DeleteDeviceCommandMongo(null, req.query.SN, arguments.ID);
        }
        res.send('OK');
    } catch (err) {
        console.log('error ini !!');
        console.error(err.message);
        next(err.message);
    }
});

router.post('/querydata', async function(req, res, next) {
    
    console.log('QUERY DATA');
    try {
        res.send(await apis.InqueryProcess(req.query, req.body));
    } catch (err) {
        console.error(err.message);
        next(err.message);
    }
});

router.post('/push', async function(req, res, next) {
    try {
        console.log('PUSH');
        //INITIALIZE COMMAND
        //-AutoServerMode
        var dataCmd = new command({
            command_id: '110',
            command_type: 'SET',
            command_target: 'OPTIONS',
            params: `AutoServerMode=1`,
            serial_number: req.query.SN
        });
        if(!dataCmd.save())
        {
            return false;
        }
        //-Sync Time Server
        var dataCmd = new command({
            command_id: '111',
            command_type: 'SET',
            command_target: 'OPTIONS',
            params: `DateTime=0`,
            serial_number: req.query.SN
        });
        if(!dataCmd.save())
        {
            return false;
        }
        res.send(await apis.GetDeviceConfig(null, req.query.SN));
    } catch (err) {
        console.error(err.message);
        next(err.message);
    }
});

router.get('/insertcommandbyget', async function(req, res, next)
{
    try {
        var dataCmd = new command({
            command_id: req.query.CMDID,
            command_type: req.query.CMDTYPE,
            command_target: req.query.CMDTARGET,
            params: req.query.CMDPARAMS,
            serial_number: req.query.SN
        });
        if(!dataCmd.save())
        {
            return false;
        }
        res.send(req.query);
    }
        catch(err)
    {
        console.log(err);
        next(err.message);
    }
});

router.get('/setcarduser', async function(req, res, next)
{
    try {
        var dataCmd = new command({
            command_id: '101',
            command_type: 'DATA',
            command_target: 'UPDATE',
            params: `user CardNo=${req.query.cardno}\tPin=${req.query.pin}\tPassword=123\tGroup=0\tStartTime=0\tEndTime=0\tName=\tPrivilege=0\r\n`,
            serial_number: 'CJ75193260004'
        });
        if(!dataCmd.save())
        {
            return false;
        }
        res.send(req.query);
    } 
        catch(err)
    {
        console.log(err);
        next(err.message);
    }
});

module.exports = router;