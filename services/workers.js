const { query } = require('express');
const config = require('../component/config');

const worker = require('../model/worker');
var device = require('./devices');
var moment = require('moment');

async function store(query = '', body = '') {
    try {
        body = PushPayloadParser(body);
        console.log('data url', query);
        console.log('data body', body);
        var idNumber = await getIdNumber();
        body.forEach(element => {
            console.log(element);


            if(element.lastname == '')
            {
                console.log('masuk if');
                var lastNameNew = '';
            } else if(element.lastname != '') { 
                console.log('masuk else');
                console.log(element.lastname);
                var lastNameNew = ` ${element.lastname}`;
            }

            console.log(lastNameNew);
            
            var filter = {uid: element['extuser pin']};
            var updateData = {name: element.firstname + lastNameNew};
            var dataWorker = worker.findOne(filter);
            
            worker.findOneAndUpdate(
                {uid: element['extuser pin']}, {
                    name: element.firstname + lastNameNew,
                    id_number: idNumber,
                    created_at: moment().format('YYYY-MM-DD hh:mm:ss'),
                },
                {upsert: true},
                function(err, doc)
                {
                    console.log('Error Upsert : ' + err);
                }
            );
        });

    } catch (err) {
        console.error(err);
        return err;
    }
}

async function storeOnlyName(query = '', body = '') {
    try {
        body = PushPayloadParser(body);
        console.log('data url', query);
        console.log('data body', body);
        var idNumber = await getIdNumber();
        body.forEach(element => {
            console.log(element);

            worker.findOneAndUpdate(
                {uid: element['pin']}, {
                    name: element.name,
                    id_number: (dataWorker.id_number != null) ? dataWorker.id_number : idNumber,
                    created_at: moment().format('YYYY-MM-DD hh:mm:ss'),
                },
                {upsert: true},
                function(err, doc)
                {
                    console.log('Error Upsert : ' + err);
                }
            );
              
            


        });

    } catch (err) {
        console.error(err);
        return err;
    }
}

async function storeOnlyPhoto(query = '', body = '', biophoto) {
    try {
        body = PushPayloadParser(body);
        console.log('data url', query);
        console.log('data body', body);
        body.forEach(element => {
            console.log(element);

            worker.findOneAndUpdate(
                {uid: element['biophoto pin']}, {
                    name: element.name,
                    photo_base64: biophoto,
                    created_at: moment().format('YYYY-MM-DD hh:mm:ss'),
                },
                {upsert: true},
                function(err, doc)
                {
                    console.log('Error Upsert : ' + err);
                }
            );
              
            


        });

    } catch (err) {
        console.error(err);
        return err;
    }
}

module.exports = {
    store,
    storeOnlyName,
    storeOnlyPhoto
};


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


async function getIdNumber() { 
    var workerFind = await worker.find().sort({id_number : -1}).limit(1);
    var intId = parseInt(workerFind[0]['id_number'])+1;
    var stringId = String(intId);
    
    return stringId;

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