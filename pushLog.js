// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var fs = require('fs');

function pushHistory(){
    fs.writeFileSync("./log/test.json" , JSON.stringify({test:'test'}))
    console.log("TESTSEDASDzzzzz");
}

// module.exports = exports = pushLogs;
module.exports = exports = pushHistory;
