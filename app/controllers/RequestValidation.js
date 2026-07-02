//* array of each key-value pair: Object.entries(req.body)[j][1])
//* object keys: Object.entries(req.body)[j][1][k][0])
//* key values: Object.entries(req.body)[j][1][k][1])

//* the key's value: Object.entries(reqBody)[i][1]
//* the associated "IsNullable" value: Object.entries(reqBody)[i+1][1]
exports.RequestValidation = async function (reqBody) {
  let success = true
  for (let i = 0; i < Object.entries(reqBody).length; i++) {
    if (!Object.entries(reqBody)[i+1][1] && !Object.entries(reqBody)[i][1]) {
      success = false
    }
    i = i+1
  }

  return {
    isSuccess: success
  }
}