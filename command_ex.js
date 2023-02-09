

var dataCmd = new command({
    command_id: '101',
    command_type: 'DATA',
    command_target: 'UPDATE',
    params: `user CardNo=\tPin=${dataPayload[0]['pin']}\tPassword=123tGroup=1\tStartTime=0\tEndTime=0\tName=1\tPrivilege=0\r\n`,
    serial_number: dataDevice[i].serial_number
});

var dataCmd2 = new command({
    command_id: '102',
    command_type: 'DATA',
    command_target: 'UPDATE',
    params: `userauthorize Pin=${dataPayload[0]['pin']}\tAuthorizeTimezoneId=1\tAuthorizeDoorId=1\tDevId=1\r\n`,
    serial_number: dataDevice[i].serial_number
});

var dataCmd = new command({
    command_id: '103',
    command_type: 'DATA',
    command_target: 'UPDATE',
    params: `extuser Pin=${dataPayload[0]['extuser pin']}\tFunSwitch=1\tFirstName=${dataPayload[0]['firstname']}\tLastName=${dataPayload[0]['lastname']}\tPersonalVs=255\r\n`,
    serial_number: dataDevice[i].serial_number
});

