window.onload = function() {
    var socket = io.connect('http://localhost:3200');
    var status = document.getElementById("status");
    var settings = document.getElementById("settings");
    var save = document.getElementById("save");
    var back = document.getElementById("back");
    var signs = document.getElementById("signs");
    var sign1 = document.getElementById("sign1");
    var sign2 = document.getElementById("sign2");
    var sign3 = document.getElementById("sign3");
    var gpsRange=document.getElementById("gps_range");
    var loading = document.getElementById("loadingScreen");

    var $progress = $('.ui.progress');

    socket.on('initialize', function (data) {
        console.log("Initialize !!");
         switch (data.assets.length) {
            case 1:
                sign1.children[0].src=data.assets[0];
                if ( signs.className.match(/(?:^|\s)two(?!\S)/) )  {
                    signs.className=signs.className.replace( /(?:^|\s)two(?!\S)/g , ' one' );
                }
                else if (signs.className.match(/(?:^|\s)three(?!\S)/) ) {
                    signs.className=signs.className.replace( /(?:^|\s)three(?!\S)/g , ' one' );
                }  
                if(data.assets_status[0])
                    sign1.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign1.style.background="rgba(191, 191, 191,0.75)";
            break;
                break;
            case 2:
                sign1.children[0].src=data.assets[0];
                sign2.children[0].src=data.assets[1];
                if ( signs.className.match(/(?:^|\s)one(?!\S)/) )  {
                    signs.className=signs.className.replace( /(?:^|\s)one(?!\S)/g , ' two' );
                }
                else if (signs.className.match(/(?:^|\s)three(?!\S)/) ) {
                    signs.className=signs.className.replace( /(?:^|\s)three(?!\S)/g , ' two' );
                }  
                break;
                if(data.assets_status[0])
                    sign1.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign1.style.background="rgba(191, 191, 191,0.75)";
                if(data.assets_status[1])
                    sign2.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign2.style.background="rgba(191, 191, 191,0.75)";
            case 3:
                sign1.children[0].src=data.assets[0];
                sign2.children[0].src=data.assets[1];
                sign3.children[0].src=data.assets[2];
                if ( signs.className.match(/(?:^|\s)one(?!\S)/) )  {
                    signs.className=signs.className.replace( /(?:^|\s)one(?!\S)/g , ' three' );
                }
                else if (signs.className.match(/(?:^|\s)two(?!\S)/) ) {
                    signs.className=signs.className.replace( /(?:^|\s)two(?!\S)/g , ' three' );
                }  
                if(data.assets_status[0])
                    sign1.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign1.style.background="rgba(191, 191, 191,0.75)";
                if(data.assets_status[1])
                    sign2.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign2.style.background="rgba(191, 191, 191,0.75)";
                if(data.assets_status[2])
                    sign3.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign3.style.background="rgba(191, 191, 191,0.75)";
                break;
            default:
                console.log("ERROR: unknown number of signs");
        }
        var sc = document.getElementById("sign_container");
        sc.replaceChild(signs,loadingScreen);
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
        console.log("Signs : "+data.assets.length);
        switch (data.assets.length) {
            case 1:
                sign1.children[0].src=data.assets[0];
                if ( signs.className.match(/(?:^|\s)two(?!\S)/) )  {
                    signs.className=signs.className.replace( /(?:^|\s)two(?!\S)/g , ' one' );
                }
                else if (signs.className.match(/(?:^|\s)three(?!\S)/) ) {
                    signs.className=signs.className.replace( /(?:^|\s)three(?!\S)/g , ' one' );
                }  
                break;
            case 2:
                sign1.children[0].src=data.assets[0];
                sign2.children[0].src=data.assets[1];
                if ( signs.className.match(/(?:^|\s)one(?!\S)/) )  {
                    signs.className=signs.className.replace( /(?:^|\s)one(?!\S)/g , ' two' );
                }
                else if (signs.className.match(/(?:^|\s)three(?!\S)/) ) {
                    signs.className=signs.className.replace( /(?:^|\s)three(?!\S)/g , ' two' );
                }  
                break;
            case 3:
                sign1.children[0].src=data.assets[0];
                sign2.children[0].src=data.assets[1];
                sign3.children[0].src=data.assets[2];
                if ( signs.className.match(/(?:^|\s)one(?!\S)/) )  {
                    signs.className=signs.className.replace( /(?:^|\s)one(?!\S)/g , ' three' );
                }
                else if (signs.className.match(/(?:^|\s)two(?!\S)/) ) {
                    signs.className=signs.className.replace( /(?:^|\s)two(?!\S)/g , ' three' );
                }  
                break;
            default:
                console.log("ERROR: unknown number of signs");
        }
    });
    
    if(gpsRange)    {
        gpsRange.onchange=function()   {
            console.log("set GPS Range: "+this.value+"%");
            socket.emit("gpsRange",this.value);
        }
    }

    socket.on('sign_status', function (data) {
        console.log("Sign Status");
        switch (data.assets_status.length) {
            case 1:
                if(data.assets_status[0])
                    sign1.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign1.style.background="rgba(191, 191, 191,0.75)";
            break;
            case 2:
                if(data.assets_status[0])
                    sign1.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign1.style.background="rgba(191, 191, 191,0.75)";
                if(data.assets_status[1])
                    sign2.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign2.style.background="rgba(191, 191, 191,0.75)";
            break;
            case 3:
                if(data.assets_status[0])
                    sign1.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign1.style.background="rgba(191, 191, 191,0.75)";
                if(data.assets_status[1])
                    sign2.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign2.style.backgroundColor="white";
                if(data.assets_status[2])
                    sign3.style.background="rgba(76, 175, 80, 0.6)";
                else
                    sign3.style.background="rgba(191, 191, 191,0.75)";
            break;
            default:
                sign1.style.background="rgba(191, 191, 191,0.75)";
                sign2.style.background="rgba(191, 191, 191,0.75)";
                sign3.style.background="rgba(191, 191, 191,0.75)";
        }
    });
    
    socket.on('settings', function (controls) {
        console.log(" settings : "+controls);
        if (controls)   {
            location.reload();
            var sc = document.getElementById("sign_container");
            sc.style.height="70%";
        }
        else  {
            location.reload();
            var sc = document.getElementById("sign_container");
            sc.style.height="85%";
        }
    });


    status.onclick = function() {
        if (status.innerHTML == 'Start')    {
            $progress.transition('scale');
            window.fakeProgress = setInterval(function() {
                $progress.progress('increment');
                if($progress.progress('is complete'))   {
                    clearInterval(window.fakeProgress);
                    
            }},10);
            socket.emit('start','Start the reader');
        }
        else   
            socket.emit('stop', 'Stop the reader');
        status.className=status.className.replace( /(?:^|\s)button(?!\S)/g , ' loading button' );
    };

    settings.onclick = function() {
        $progress.transition('scale');
        socket.emit('settings','toggle settings tab');
    };

    save.onclick = function() {
        $('.ui.modal')
          .modal({
            blurring: true,
            onApprove : function() {
                var logName = document.getElementById("logName");
                socket.emit('save',logName.value);
            }
          })
          .modal('show')
        ;
    };

    back.onclick = function() {
        window.history.back();
    };
}