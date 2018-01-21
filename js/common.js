$.support.cors = true;

function debug(msg) {
    switch(typeof msg) {
        case 'object':
            var propValue;
            for(var propName in msg) {
                propValue = msg[propName];

                System.Debug.outputString(propName + ': ' + propValue);
            }
            break;
        case 'array':
            for (var i = 0; i < msg.length; i++) {
                System.Debug.outputString(msg[i]);
            }
            break;
        default:
            System.Debug.outputString(msg);
            break;
    }
}