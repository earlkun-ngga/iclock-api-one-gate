const { query } = require('express');
const config = require('../component/config');

const permission = require('../model/permission_worker');
const workerBiodata = require('./workers-biodata');
const workerBiodataModel = require('../model/worker-biodata');
var moment = require('moment');

async function storeBiodata(query = '', body = '') {
    try {
        body = PushPayloadParser(body);
        console.log('data url', query);
        // console.log('data body', body);
        body.forEach(async element => {


            var condition = {
                uid: element['biophoto pin'],
                type: '0',
            };

            var absent = await permission.findOne(condition);
            console.log(absent);

            if (absent) {
                //     console.log(absent);

                if (absent.biophoto_id == null) {
                    console.log('update');
                    var update = await workerBiodataModel.findOneAndUpdate(absent.biophoto_id, {
                        content: element.content
                    });

                    if (!update) {
                        console.log('not input');
                        return false;
                    }

                } else {
                    console.log('nothing');

                    return true;

                }
            } else {
                saveBiodata = await workerBiodata.store(element);
                // console.log(saveBiodata);
                if (saveBiodata) {
                    // console.log('input', saveBiodata._id);
                    var data = new permission({
                        uid: element['biophoto pin'],
                        biophoto_id: saveBiodata._id,
                        type: element.type,
                        status: '01',
                    });

                    if (!data.save()) {
                        console.log('not input');
                        return;
                    }
                }
            }
        });


        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = {
    storeBiodata
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