function getridof2(value) {
    console.log(value)
    if (value[0] =='-'){
        console.log(value)
        value.slice(1)
        return value.slice(1)
    }
    else
        console.log(value)
        return value
  } 

function getValues(mykey, myObject){
    if (mykey.includes(' ')){
        const myvalue = mykey.split(' ').pop()
        mykey = mykey.split(' ')[0]
        myObject[mykey] = myvalue
    }
    else

        myObject[mykey] = true
}
//console.log(jsonify("-a -p 2 --output-time"))
function jsonify(myString){
    var jsonObject = {}
    const myArray = myString.split(' -');
    var filtered = myArray.map(s => getridof2(s))
    var jsonReady = filtered.map(s => getValues(s,jsonObject))
    //var myJsonString = JSON.stringify(jsonObject);
    return jsonObject
}