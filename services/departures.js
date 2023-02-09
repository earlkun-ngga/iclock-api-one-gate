const { query } = require('express');
const config = require('../component/config');
const { default: ObjectID } = require('bson-objectid');

const departure = require('../model/departure');
const departure_detail = require('../model/departure_detail');
const code_item = require('../model/code_item');
const worker = require('../model/worker');
const company = require('../model/company');
const device = require('../model/device');
const location = require('../model/location');
const card = require('../model/card');
const mongoose = require('mongoose');
const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
}
var moment = require('moment');
var idWorker = null;

async function store(query = '', body = '', location_id) {
    console.log(location_id);
    try {

        if(query.isve)
        {
            body = body;
        } else {
            body = PushPayloadParser(body);
        }
        
        var today = moment().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
        var tommorow = moment(today).add(1, 'days').toISOString();
        


        if(query.isve) {
              var dataWorker = await worker.findOne({
                    uid: body.pin,
                    deleted_at: {$exists: false}
                });
                idWorker = dataWorker._id;
                var time = body.time;
                var splitTime = time.split(' ');

                if (moment().format('YYYY-MM-DD') != splitTime[0]) { 
                    console.log('not valid date'); 
                    return false; }
                splitTime[0] = splitTime[0] + 'T';
                splitTime[1] = splitTime[1] + '.000+00:00';
                if (body.verifytype == '15') {
                    body.verifytype = '01';
                } else if (body.verifytype == '3') {
                    body.verifytype = '04';
                } else if (body.verifytype == '4') {
                     body.verifytype = '03';
                }
                else if(body.verifytype == '200')
                {  
                    console.log('not input');
                    return false;
                }
                
                var absent = await departure_detail.findOne({
                    worker_id: mongoose.Types.ObjectId(dataWorker._id)
                }).sort({_id:-1});
                
                console.log('ABSENT : ' + absent);
                
                if (absent) {
                    if (absent.out_time == null) {
                        //DEVICE OUT
                        var deviceOutWorker = await device.findOne({serial_number: query.SN});
                        updateDeparture(dataWorker, deviceOutWorker, query, splitTime[0], splitTime[1]);
                        updateDepartureDetail(dataWorker, deviceOutWorker, query, splitTime[0], splitTime[1]);
                    } else {
                        //COMPANY, DEVICE IN, LOCATION, CARD
                        var companyWorker = await company.findOne({_id: mongoose.Types.ObjectId(dataWorker.comp_id)});
                        var deviceInWorker = await device.findOne({serial_number: query.SN});
                        var locationWorker = await location.findOne({_id: mongoose.Types.ObjectId(deviceInWorker.location_id)});
                        var cardWorker = await card.findOne({worker_id: mongoose.Types.ObjectId(dataWorker._id)});
                        var departureTodayMain = await departure.findOne({
                            worker_id: mongoose.Types.ObjectId(dataWorker._id)
                        }).sort({_id:-1});
                        //UPDATE MAIN OUT TO NULL
                        var deviceOutWorker = await device.findOne({serial_number: query.SN});

                        updateDeparture(dataWorker, deviceOutWorker, query, '', '');

                        insertDepartureDetail(departureTodayMain._id, dataWorker, locationWorker, companyWorker, deviceInWorker, cardWorker, query, splitTime[0], splitTime[1], body);
                    }
                } else {
                    //COMPANY, DEVICE IN, LOCATION, CARD
                    var companyWorker = await company.findOne({_id: mongoose.Types.ObjectId(dataWorker.comp_id)});
                    var deviceInWorker = await device.findOne({serial_number: query.SN});
                    var locationWorker = await location.findOne({_id: mongoose.Types.ObjectId(deviceInWorker.location_id)});
                    var cardWorker = await card.findOne({worker_id: mongoose.Types.ObjectId(dataWorker._id)});
                   
                    //IF FIRST TIME NO DATA CREATE MAIN
                    insertDeparture(dataWorker, locationWorker, companyWorker, deviceInWorker, cardWorker, query,  splitTime[0], splitTime[1], body);
                }

                //DELETE DUPLICATE DATA
                await setTimeout(async function(){
                    var absent = await departure.count({
                        worker_id: mongoose.Types.ObjectId(dataWorker._id),
                        out_time: null
                    }).sort({_id:-1});
                    if(absent > 1)
                    {
                        await departure.findOneAndDelete({
                            worker_id: mongoose.Types.ObjectId(dataWorker._id)
                        }).sort({_id:-1});
                        console.log("ADA DUPLIKAT !");
                    }
                }, 3000);

        } else { 
            body.forEach(async element => {
              var dataWorker = await worker.findOne({
                    uid: element.pin,
                    deleted_at: {$exists: false}
                });
                
                var time = element.time;
                var splitTime = time.split(' ');

                if (moment().format('YYYY-MM-DD') != splitTime[0]) { 
                    console.log('not valid date'); 
                    return false; }
                splitTime[0] = splitTime[0] + 'T';
                splitTime[1] = splitTime[1] + '.000+00:00';
                if (element.verifytype == '15') {
                    element.verifytype = '01';
                } else if (element.verifytype == '3') {
                    element.verifytype = '04';
                } else if (element.verifytype == '4') {
                    element.verifytype = '03';
                } else if(element.verifytype == '200')
                {  
                    return false;
                }
                console.log('ElementType : ' + element.verifytype);
                var absent = await departure_detail.findOne({
                    worker_id: mongoose.Types.ObjectId(dataWorker._id)
                }).sort({_id:-1});


                if (absent) {
                    if (absent.out_time == null) {
                        //DEVICE OUT
                        var deviceOutWorker = await device.findOne({serial_number: query.SN});
                        updateDeparture(dataWorker, deviceOutWorker, query, splitTime[0], splitTime[1]);
                        updateDepartureDetail(dataWorker, deviceOutWorker, query, splitTime[0], splitTime[1]);
                    } else {
                        //COMPANY, DEVICE IN, LOCATION, CARD
                        console.log('MASUK SITU !');
                        var companyWorker = await company.findOne({_id: mongoose.Types.ObjectId(dataWorker.comp_id)});
                        var deviceInWorker = await device.findOne({serial_number: query.SN});
                        var locationWorker = await location.findOne({_id: mongoose.Types.ObjectId(deviceInWorker.location_id)});
                        var cardWorker = await card.findOne({worker_id: mongoose.Types.ObjectId(dataWorker._id)});
                       

                        //UPDATE MAIN OUT TO NULL
                        var deviceOutWorker = await device.findOne({serial_number: query.SN});
                        updateDeparture(dataWorker, deviceOutWorker, query, '', '');

                        var departureTodayMain = await departure.findOne({ worker_id: mongoose.Types.ObjectId(dataWorker._id)}).sort({_id:-1});

                        insertDepartureDetail( departureTodayMain._id, dataWorker, locationWorker, companyWorker, deviceInWorker, cardWorker, 
                            query, 
                            splitTime[0], 
                            splitTime[1], 
                            element);
                    }
                } else {
                   //COMPANY, DEVICE IN, LOCATION, CARD
                   console.log('MASUK SINI !');
                   var companyWorker = await company.findOne({_id: mongoose.Types.ObjectId(dataWorker.comp_id)});
                   var deviceInWorker = await device.findOne({serial_number: query.SN});
                   var locationWorker = await location.findOne({_id: mongoose.Types.ObjectId(deviceInWorker.location_id)});
                   var cardWorker = await card.findOne({worker_id: mongoose.Types.ObjectId(dataWorker._id)});
                   

                 insertDeparture( dataWorker, locationWorker, companyWorker, deviceInWorker, cardWorker, query,  splitTime[0], splitTime[1], element);
                }
                //DELETE DUPLICATE DATA
                await setTimeout(async function(){
                    var absent = await departure.count({
                        worker_id: mongoose.Types.ObjectId(dataWorker._id),
                        out_time: null
                    }).sort({_id:-1});
                    if(absent > 1)
                    {
                        await departure.findOneAndDelete({
                            worker_id: mongoose.Types.ObjectId(dataWorker._id)
                        }).sort({_id:-1});
                        console.log("ADA DUPLIKAT !");
                    }
                }, 3000);
            });
        }

        // update web variable token real time to observe in out data
        var update = await code_item.findOneAndUpdate({
            item_id: 'token_rt_dashboard_visitor_by_loc',
            code_id: 99,
        },{ token:  (Math.random() + 1).toString(36).substring(2)});

    return true;

    } catch (err) {
        console.error(err);
        return err;
    }
}

module.exports = {
    store
};



//function

function QueryPayloadParser(data) {
    var ret = [];

    data.trim().split('\r\n').forEach(element => {
        const tkey = element.split(' ')[0];
        const tvalue = {};
        element.split(' ')[1].split('\t').forEach(x => {
            tvalue[x.split('=')[0]] = x.split('=')[1];
        });

        ret.push({ key: tkey, item: tvalue });
    });

    return ret;
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

async function insertDeparture (
    dataWorker, 
    locationWorker, 
    companyWorker, 
    deviceInWorker,
    cardWorker, 
    query, 
    splitTime0, 
    splitTime1, 
    element
    ) {

var data = new departure({
    worker_id: mongoose.Types.ObjectId(dataWorker._id),
    worker_name: dataWorker.name,
    worker_id_number: dataWorker.id_number,
    worker_type: dataWorker.type,
    comp_id:(dataWorker.comp_id) ? mongoose.Types.ObjectId(dataWorker.comp_id) : null,
    company_name:(companyWorker) ? companyWorker.name : '',
    device_sn_in: query.SN,
    device_id_sn_in: mongoose.Types.ObjectId(deviceInWorker._id),
    verify_type: element.verifytype,
    location_id: locationWorker._id,
    location_name: locationWorker.name,
    card_id: (cardWorker) ? mongoose.Types.ObjectId(cardWorker._id) : null,
    card_number: (cardWorker) ? cardWorker.card_number : '', 
    in_time: splitTime0 + splitTime1,
    status: '01',
    company_short_name: (companyWorker) ? companyWorker.short_name : '',
    created_at: splitTime0 + splitTime1,
    updated_at: splitTime0 + splitTime1
});
// if (!await data.save()) {
//     console.log('not input');
//     return false;
// }
    try {
        await data.save(function(err, dt)
        {
            var data_detail = new departure_detail({
                departure_today_id: mongoose.Types.ObjectId(dt._id),
                worker_id: mongoose.Types.ObjectId(dataWorker._id),
                worker_name: dataWorker.name,
                worker_id_number: dataWorker.id_number,
                worker_type: dataWorker.type,
                comp_id:(dataWorker.comp_id) ? mongoose.Types.ObjectId(dataWorker.comp_id) : null,
                company_name:(companyWorker) ? companyWorker.name : '',
                device_sn_in: query.SN,
                device_id_sn_in: mongoose.Types.ObjectId(deviceInWorker._id),
                verify_type: element.verifytype,
                location_id: locationWorker._id,
                location_name: locationWorker.name,
                card_id: (cardWorker) ? mongoose.Types.ObjectId(cardWorker._id) : null,
                card_number: (cardWorker) ? cardWorker.card_number : '', 
                in_time: splitTime0 + splitTime1,
                status: '01',
                company_short_name: (companyWorker) ? companyWorker.short_name : '',
                created_at: splitTime0 + splitTime1,
                updated_at: splitTime0 + splitTime1
            });

            data_detail.save();
        })
    } catch(err) {
        console.log(err);
    }
}

async function insertDepartureDetail (
        idDepartureToday,
        dataWorker, 
        locationWorker, 
        companyWorker, 
        deviceInWorker,
        cardWorker, 
        query, 
        splitTime0, 
        splitTime1, 
        element
        ) {
  
    var data = new departure_detail({
        departure_today_id: mongoose.Types.ObjectId(idDepartureToday),
        worker_id: mongoose.Types.ObjectId(dataWorker._id),
        worker_name: dataWorker.name,
        worker_id_number: dataWorker.id_number,
        worker_type: dataWorker.type,
        comp_id: mongoose.Types.ObjectId(dataWorker.comp_id),
        company_name: companyWorker.name,
        device_sn_in: query.SN,
        device_id_sn_in: mongoose.Types.ObjectId(deviceInWorker._id),
        verify_type: element.verifytype,
        location_id: locationWorker._id,
        location_name: locationWorker.name,
        card_id: mongoose.Types.ObjectId(cardWorker._id),
        card_number: cardWorker.card_number, 
        in_time: splitTime0 + splitTime1,
        status: '01',
        company_short_name: companyWorker.short_name,
        created_at: splitTime0 + splitTime1,
        updated_at: splitTime0 + splitTime1
    });
    if (!await data.save()) {
        console.log('not input');
        return false;
    }

    
    
}


async function updateDepartureDetail(dataWorker, deviceOutWorker, query, splitTime0, splitTime1) { 
    var update = await departure_detail.findOneAndUpdate({
        worker_id: mongoose.Types.ObjectId(dataWorker._id)
    }, { 
        out_time: splitTime0 + splitTime1,
        device_sn_out: query.SN,
        device_id_sn_out: mongoose.Types.ObjectId(deviceOutWorker._id),
    }).sort({_id:-1});

    if (!update) {
        console.log('not input');
        return false;
    }
}

async function updateDeparture(dataWorker, deviceOutWorker, query, splitTime0, splitTime1) { 
    var update = await departure.findOneAndUpdate({
        worker_id: mongoose.Types.ObjectId(dataWorker._id)
    }, { 
        out_time: splitTime0 + splitTime1,
        device_sn_out: query.SN,
        device_id_sn_out: mongoose.Types.ObjectId(deviceOutWorker._id),
    }).sort({_id:-1});

    if (!update) {
        console.log('not input');
        return false;
    }
}
