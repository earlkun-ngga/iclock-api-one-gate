const { query } = require('express');
const mysql = require('mysql2/promise');
const config = require('../component/config');

const mapper = require('../component/mapper/device/properties');
const device = require('../model/device');
const command = require('../model/command');
var moment = require('moment');

async function execute(query, params) {
    try {
        const connection = await mysql.createConnection(config.db);
        const [rows] = await connection.execute(query, params);
        connection.end();
        return rows;
    } catch (err) {
        console.log(err.message);
        return [];
    }
}


async function GetAllDevice() {

    try {
        var data = await device.find();
        // console.log('data', data);
       
        return data;
        
    } catch (err) {
        console.error(err.message);
        return 'FAIL';
    }



}

async function GetDeviceInfoFromAuth(object_id = 'N/A', serial_number = 'N/A') {
    try {
        const data = await device.find({'serial_number': serial_number });
        console.log('data', data);
        if (data.length != 1) {
            if (await RegistryDevice(serial_number))
                throw new Error('No record device. success apply device serialnumber');
            else
                throw new Error('No record device. fail apply device serialnumber');
        }
        // throw new Error('success');

        // console.log('OK');
        return 'OK';
    } catch (err) {
        console.error(err.message);
        return 'FAIL';
    }
}

async function RegistryDevice(serial_number) {
    try {
        const data = new device({
            serial_number: serial_number
        })
        const dataToSave = await data.save();
        console.log(data.save());
        if (dataToSave._id)
            return true;
        else
            return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function GetDeviceRegistryCode(object_id = 'N/A', serial_number = 'N/A') {
    try {
        // const data = await device.find({ 'serial_number': serial_number });

        // if (data.length != 1) {
        //     throw new Error('No record device.');
        // }

        return 'RegistryCode=123';
    } catch (err) {
        console.log(err.message);
        return 'OK';
    }
}

async function GetDeviceConfig(object_id = 'N/A', serial_number = 'N/A') {
    try {
        const data = await device.find({ 'serial_number': serial_number });

        if (data.length != 1) {
            throw new Error('No record device.');
        }

        return 'ServerVersion=' + config.server.version +
            ' ServerName=' + config.server.name +
            // ' ErrorDelay=' + rows[0].error_delay +
            // ' RequestDelay=' + rows[0].request_delay +
            // ' TransTimes=' + rows[0].trans_times +
            // ' TransInterval=' + rows[0].trans_interval +
            // ' TransTables=\'User Transaction\'' +
            ' Realtime=' + rows[0].real_time +
            // ' SessionID=' + Math.random() +
            ' TimeoutSec=' + config.server.timeout;

    } catch (err) {
        console.log(err.message);
        return 'OK';
    }
}

async function SetDeviceUptimeFromAuth(object_id = 'N/A', serial_number = 'N/A') {
    try {
        const data = await device.findOne({'serial_number': serial_number });
        data.last_uptime = moment().format()

        if (await data.save())
            return true;
        else
            return false;
        // return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function GetDeviceCommand(object_id = 'N/A', serial_number = 'N/A') {
    try {
        const rows = await execute(mapper.READ_DEVICE_COMMAND, [object_id, serial_number]);
        const data = rows;

        if (data.length != 1) {
            return 'OK';
        } else {
            return 'C:' + data[0].command_id + ':' + data[0].command_type + ' ' + data[0].command_target + ' ' + data[0].params;
        }
    } catch (err) {
        return 'OK';
    }
}

async function GetDeviceCommandMongo(object_id = 'N/A', serial_number = 'N/A') {
    try {
        // const rows = await execute(mapper.READ_DEVICE_COMMAND, [object_id, serial_number]);
        // const data = rows;

        var data = await command.findOne({serial_number: serial_number});

        // console.log('Panjang Data:' + (data ==null));
        // console.log(data['serial_number']);
        // console.log('C:' + data['command_id'] + ':' + data['command_type'] + ' ' + data['command_target'] + ' ' + data['params']);



        if (data == null) {
            return 'OK';
        } else {
            return 'C:' + data['command_id'] + ':' + data['command_type'] + ' ' + data['command_target'] + ' ' + data['params'];
        }
    

    } catch (err) {
        return 'OK';
    }
}

// async function GetDeviceCommand(object_id = 'N/A', serial_number = 'N/A') {
//     try {
//         // const rows = await execute(mapper.READ_DEVICE_COMMAND, [object_id, serial_number]);
//         // const data = rows;
//         const data = device

//         if (data.length != 1) {
//             return 'OK';
//         } else {
//             return 'C:' + data[0].command_id + ':' + data[0].command_type + ' ' + data[0].command_target + ' ' + data[0].params;
//         }
//     } catch (err) {
//         return 'OK';
//     }
// }

async function DeleteDeviceCommand(object_id = 'N/A', serial_number = 'N/A', command_id) {
    try {
        const rows = await execute(mapper.DELETE_DEVICE_COMMAND, [object_id, serial_number, command_id]);
        const data = rows;

        if (data.affectedRows != 1)
            return false;
        else
            return true;
    } catch (err) {
        return false;
    }
}

async function DeleteDeviceCommandMongo(object_id = 'N/A', serial_number = 'N/A', command_id) {
    try {
        // const rows = await execute(mapper.DELETE_DEVICE_COMMAND, [object_id, serial_number, command_id]);
        // const data = rows;

        // await command.deleteOne({command_id: command_id, serial_number: serial_number});
        var data = await command.findOneAndDelete({command_id: String(command_id), serial_number: String(serial_number)});
        console.log('DVC CMDID : ' + command_id);
        console.log('DVC SN : ' + serial_number);
        console.log(data);
        // if (data)
        //     return false;
        // else
        //     return true;
    } catch (err) {
        return false;
    }
}


async function EventProcess(queries, data) {
    try {
        switch (queries.table) {
            case "rtstate":
                console.log('rtstate');
                // system log
                return 'OK';
            case "tabledata":
                if (queries.tablename == 'biodata') {
                    console.log('biodata');
                    // system log
                    // return '';
                } else if (queries.tablename == 'user') {
                    console.log('user');
                    // system log
                    // return '';
                } else if (queries.tablename == 'extuser') {
                    console.log('user');
                    // system log
                    // return '';
                }

            case "rtlog":
                console.log('log');
                // inout log
                const ret = PushPayloadParser(data);
                // console.log(ret);
                return '';
            default:
                break;
        }
    } catch (err) {
        return 'FAIL';
    }

}

async function InqueryProcess(queries, data) {
    try {
        switch (queries.type) {
            case "tabledata":
                switch (queries.tablename) {
                    case "user":
                        const ret = QueryPayloadParser(data);
                        console.log(ret);
                        return "user=" + queries.count;
                    default:
                        return "OK";
                }

            default:
                return "OK";
        }
    } catch (err) {
        console.log(err);
        return "OK";
    }
}

async function CommandResultParser(data) {
    var arguments = {};

    data.split('&').forEach(element => {
        const temp = element.split('=');
        arguments[temp[0]] = temp[1];
    });

    return arguments;
}

module.exports = {
    GetAllDevice,
    GetDeviceInfoFromAuth,
    SetDeviceUptimeFromAuth,
    GetDeviceRegistryCode,
    GetDeviceConfig,
    GetDeviceCommand,
    GetDeviceCommandMongo,
    DeleteDeviceCommand,
    DeleteDeviceCommandMongo,
    EventProcess,
    InqueryProcess,
    CommandResultParser
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