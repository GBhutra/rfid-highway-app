window.onload = function() {
    var messages = [];
    var socket = io.connect('http://localhost:3200');
    var status = document.getElementById("status");
    var layout = document.getElementById("layout");
    var save = document.getElementById("save");
    var back = document.getElementById("back");

    var content = document.getElementById("disp");

    socket.on('initialize', function (data) {
    });

    socket.on('status', function (data) {
        console.log("Status : "+data);
        if('start'==data)   
            status.innerHTML = 'Stop';
        else if('stop'==data)
            status.innerHTML = 'Start';
        status.className=status.className.replace( /(?:^|\s)loading(?!\S)/g , '' );
    });

    socket.on('signs', function (data) {
        console.log("Signs : "+data);
        if('update'==data)
            location.reload();
    });

    socket.on('sign_status', function (data) {
        console.log("Sign Status : "+data);
        if('update'==data)
            location.reload();
    });


    status.onclick = function() {
        if (status.innerHTML == 'Start') 
            socket.emit('start','Start the reader');
        else   
            socket.emit('stop', 'Stop the reader');
        status.className=status.className.replace( /(?:^|\s)button(?!\S)/g , ' loading button' );
    };

    layout.onclick = function() {
        socket.emit('layout','Change the layout');
    };

    save.onclick = function() {
        socket.emit('save','save the file');
    };

    back.onclick = function() {
        window.history.back();
    };
}