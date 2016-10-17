window.onload = function() {
    var log=true;
    var socket = io.connect('http://localhost:3300');
    var gpsRange = 50;
    
    var bVis_controls = false;
    var bVis_moreInfo = false;

    var maxTags=1;
    var seenTags=0;

    $('#gps_range_up').click(function()  {   
        if (gpsRange<450)
            gpsRange=gpsRange+50;
        if (log) console.log("gps range: "+gpsRange);
        $('#gps_range').html(gpsRange.toString()+' feet&nbsp&nbsp');
        socket.emit('gps_range_req',{val: 1});
    });

    $('#gps_range_down').click(function()  {   
        if (gpsRange>50)
            gpsRange=gpsRange-50;
        if (log) console.log("gps range: "+gpsRange);
        $('#gps_range').html(gpsRange.toString()+' feet&nbsp&nbsp');
        socket.emit('gps_range_req',{val: 0});
    });

    $('#more_info').click(function() {
        bVis_moreInfo = !bVis_moreInfo;
        if (log) console.log("bVis_moreInfo: "+bVis_moreInfo);
        if (bVis_moreInfo)  {
            $('#sign21_asset').height('80%');
            $('#sign22_asset').height('80%');
            
        }
        else    {
            $('#sign21_asset').height('100%');
            $('#sign22_asset').height('100%');
           
        }
        $('#sign21_info').transition('scale');
        $('#sign22_info').transition('scale');
    });

    $('#sign_container').click(function()   {
        $('#navigation').transition('scale');
        if (!bVis_controls)   
            $('#sign_container').height('80%');
        else    {
            $('#sign_container').height('100%');
            $('#settings_segment').transition('hide');
        }
        bVis_controls = !bVis_controls;
    });

     $('#status').click(function() {
        if (log) console.log("Status button clicked !");
        if ($('#status').html() == 'Resume')    {
            if (log) console.log("Resume the reader");
            socket.emit('rfid_reader_resume','resume the reader');
        }
        else    {  
            if (log) console.log("Pause the reader");
            socket.emit('rfid_reader_pause', 'pause the reader');
        }
        $('#status').addClass('loading');
    });


    //Save button saves the log on the server.
    $('#save').click(function() {
        $('.save.ui.modal')
          .modal({
            blurring: true,
            onApprove : function() {
                var logName = document.getElementById("logName");
                socket.emit('rfid_saveLog',logName.value);
                location.href="/";
            }})
          .modal('show');
    });

    //Exit button
    $('#exit').click(function() {
        location.href="/inventory/";
    });

    socket.on('initialize', function (data) {
        if (log) console.log("Initialize !!");
        if (log) console.log(data.maxTags+" "+data.seenTags);
        maxTags = parseInt(data.maxTags);
        seenTags = parseInt(data.seenTags);
        var rem = maxTags-seenTags;
        if (rem<0)
            rem=0;
        $('#rem_tags').html(rem.toString());
        $('#seen_tags').html(seenTags.toString());
        $('#sign_container').click();
        if ($('#twoSign').hasClass('hidden'))
            $('#twoSign').transition('scale');
    });

    socket.on('tagCount_update', function (data) {
        if (log) console.log("tagCount_update");
        if (log) console.log(data);
        maxTags = parseInt(data.maxTags);
        seenTags = parseInt(data.seenTags);
        var rem = maxTags-seenTags;
        if (rem<0)
            rem=0;
        $('#rem_tags').html(rem.toString());
        $('#seen_tags').html(seenTags.toString());
    });


    socket.on('rfid_reader_status', function (data) {
        if (log) console.log("Status : "+data.status);
        if('ACTIVE'==data.status)   {
            $('#status').html('Pause');
            $('.err.ui.basic.modal').modal('hide');
            $('.err.ui.basic.modal').removeClass('active');
            $('.ui.active.centered.inline.loader').transition('scale');
        }
        else if('IDLE'==data.status)    {
            $('#status').html('Resume');
            $('.ui.active.centered.inline.loader').transition('hide');
        }
        else    {
            $('#status').html('Resume');
            $('.err.ui.basic.modal')
            .modal({
                closable : false,
                blurring: true,
                onDeny  :function() {
                    location.href='/inventory';
                },
                onApprove:  function() {
                    socket.emit('connect_rfid_reader',{maxTags:maxTags});
                    $('#reconnect').addClass('loading');
                    return false;
                } 
            })
            .modal('show');
            $('.ui.active.centered.inline.loader').transition('hide');
        }
        $('#status').removeClass('loading');
        $('#reconnect').removeClass('loading');
    });

    socket.on('gps_range_res', function (data) {
        if (log) console.log("GPS Range : "+data.val);
        gpsRange = Math.round(50*data.val);
        $('#gps_range').html(gpsRange.toString()+' feet&nbsp&nbsp');
    });
}