window.onload = function() {
    var socket = io.connect('http://rfid_raspberrypi:3200');
    var reader = document.getElementById("reader");
    var gps = document.getElementById("gps");
    socket.on('initialize', function (data) {

    }

    socket.on('status_newTag', function (data) {
        console.log("Status : "+data);
        if('start'==data)   {   
            reader.innerHTML = 'Stop';
            reader.className=reader.className.replace( /(?:^|\s)loading(?!\S)/g , '' );
        }
        else if('stop'==data)   {
            reader.innerHTML = 'Start';
            reader.className=reader.className.replace( /(?:^|\s)loading(?!\S)/g , '' );
        }
        else
            console.error("!!error");
    });

    reader.onclick = function() {
        if (reader.innerHTML == 'Start') 
            socket.emit('start_newTag','New Tag');
        else   
            socket.emit('stop_newTag', 'New Tag');
        reader.className=reader.className.replace( /(?:^|\s)button(?!\S)/g , ' loading button' );
    };
}