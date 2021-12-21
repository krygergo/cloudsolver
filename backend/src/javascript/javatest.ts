export const configToJSONParser = (configString: string): {[key: string]: any} => {
    const _configToJSONParser = (configs: string[], result: {[key: string]: any}): {[key: string]: any} => {
        if(configs.length === 0)
            return result;
        if(configs.length === 1) {
            const key = resolveKey(configs[0]);
            result[key] = true;
            return result;
        }
        const next = configs.shift()!;
        const key = resolveKey(next);
        if(configs[0].startsWith("-"))
            result[key] = true;
        else
            result[key] = configs.shift()!;
        return _configToJSONParser(configs, result);
    }
    const resolveKey = (flag: string) => {
        if(flag.startsWith("--"))
            return flag.slice(2, flag.length);
        else 
            return flag.slice(1, flag.length);
    }

    return _configToJSONParser(configString.split(" "), {});
}
function getridof2(value : string) {
    if (value[0] =='-'){
        value.slice(1)
        return value.slice(1)
    }
    else
        return value
  } 

function getValues(mykey : string,myObject:{ [key : string]: any} ){
    if (mykey.includes(' ')){
        const myvalue = mykey.split(' ').pop()
        mykey = mykey.split(' ')[0]
        myObject[mykey] = myvalue
    }
    else

        myObject[mykey] = true
}
console.log("1")
console.log(jsonify("-a -p 2 --output-time"))
console.log("2")
console.log(configToJSONParser("-a -p 2 --output-time"))
export function jsonify(myString :string){
    var jsonObject = {}
    const myArray = myString.split(' -');
    var filtered = myArray.map(s => getridof2(s))
    var jsonReady = filtered.map(s => getValues(s,jsonObject))
    //var myJsonString = JSON.stringify(jsonObject);
    return jsonObject
}