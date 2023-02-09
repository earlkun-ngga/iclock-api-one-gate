const { query } = require('express');
const config = require('../component/config');

const workerBiodata = require('../model/worker-biodata');
var moment = require('moment');

async function store(element) {
    try {
        // body = PushPayloadParser(body);
        // console.log('data url', query);
        // console.log('data body', body);
        // body.forEach(element => {
        // console.log(element);
        var data = new workerBiodata({
            uid: element['biophoto pin'],
            filename: element.filename,
            type: element.type,
            size: element.size,
            content: 'data:image/jpeg;base64,' + element.content,
        });

        if (!data.save()) {
            return;
        }

        // });
        // console.log('biodatasave', data);
        return data

    } catch (err) {
        console.error(err);
        return;
    }
}

module.exports = {
    store
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