const CREATE_DEVICE_INFO = "INSERT INTO devices (serial_number) VALUES (?)";
const READ_DEVICE_INFO = "SELECT object_id, serial_number, registry_code, error_delay, request_delay, real_time, trans_times, trans_interval FROM devices WHERE object_id=? OR serial_number=?";
const UPDATE_DEVICE_UPTIME = "UPDATE devices SET last_uptime=utc_timestamp() WHERE object_id=? OR serial_number=?";
const READ_DEVICE_COMMAND = "SELECT command_id, command_type, command_target, params FROM command WHERE object_id=? OR serial_number=? LIMIT 1";
const DELETE_DEVICE_COMMAND = "DELETE FROM command WHERE object_id=? OR serial_number=? AND command_id=?";

module.exports = {
    CREATE_DEVICE_INFO,
    READ_DEVICE_INFO,
    UPDATE_DEVICE_UPTIME,
    READ_DEVICE_COMMAND,
    DELETE_DEVICE_COMMAND
};