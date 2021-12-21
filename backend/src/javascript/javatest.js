"use strict";
exports.__esModule = true;
exports.configToJSONParser = function (configString) {
    var _configToJSONParser = function (configs, result) {
        if (configs.length === 0)
            return result;
        if (configs.length === 1) {
            var key_1 = resolveKey(configs[0]);
            result[key_1] = true;
            return result;
        }
        var next = configs.shift();
        var key = resolveKey(next);
        if (configs[0].startsWith("-"))
            result[key] = true;
        else
            result[key] = configs.shift();
        return _configToJSONParser(configs, result);
    };
    var resolveKey = function (flag) {
        if (flag.startsWith("--"))
            return flag.slice(2, flag.length);
        else
            return flag.slice(1, flag.length);
    };
    return _configToJSONParser(configString.split(" "), {});
};
function getridof2(value) {
    if (value[0] == '-') {
        value.slice(1);
        return value.slice(1);
    }
    else
        return value;
}
function getValues(mykey, myObject) {
    if (mykey.includes(' ')) {
        var myvalue = mykey.split(' ').pop();
        mykey = mykey.split(' ')[0];
        myObject[mykey] = myvalue;
    }
    else
        myObject[mykey] = true;
}
console.log("1");
console.log(jsonify("-a -p 2 --output-time"));
console.log("2");
console.log(exports.configToJSONParser("-a -p 2 --output-time"));
function jsonify(myString) {
    var jsonObject = {};
    var myArray = myString.split(' -');
    var filtered = myArray.map(function (s) { return getridof2(s); });
    var jsonReady = filtered.map(function (s) { return getValues(s, jsonObject); });
    //var myJsonString = JSON.stringify(jsonObject);
    return jsonObject;
}
exports.jsonify = jsonify;
