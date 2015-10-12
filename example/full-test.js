/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 TNO
 * Author - Joseph Sutton
 ******************************************************************************/


var OBDReader = require('../lib/obd.js'),
    opts = {
        baudrate: 115200
    },
    info = require('../lib/obdInfo.js'),
    serialOBDReader = new OBDReader("COM4", opts);

// basics
var lastKey = 0;
var maxPollers = 6;
var numPolled = 0;

serialOBDReader.on('dataReceived', function (data) {
    console.log(data);
    
    // todo: fs appendFile results for full diagnostic
    
    if(numPolled > 0) {
        numPolled--;
        
        // clear poller since we have the data
        me.removePoller(data.name);
        
        // add another poller, if possible
        var nextKey = lastKey + 1;
        
        if(info.hasOwnProperty(nextKey)) {
            me.addPoller(nextKey);
            
            numPolled++;
            lastKey = nextKey;
        }
    }
    
});

serialOBDReader.on('connected', function (data) {
    var max = lastKey + maxPollers;

    for(var key = lastKey; key < max; key++) {
        if(info.hasOwnProperty(key)) {
            var obj = info[key];
            
            me.addPoller(obj.name);
            
            numPolled++;
            lastKey = key;
        }
    }

    this.startPolling(200);
});


serialOBDReader.connect();
