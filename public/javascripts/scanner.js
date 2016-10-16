window.onload = function() {
    var log=true;
    var socket = io.connect('http://rfid_raspberrypi:3200');
    var gpsRange = 50;
    
    var bVis_controls = false;
    var bVis_moreInfo = false;

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

    $('#more_info')
    .click(function() {
        bVis_moreInfo = !bVis_moreInfo;
        if (log) console.log("bVis_moreInfo: "+bVis_moreInfo);
        if (bVis_moreInfo)  {
            $('#sign11_asset').height('80%');
            $('#sign21_asset').height('80%');
            $('#sign22_asset').height('80%');
            $('#sign31_asset').height('80%');
            $('#sign32_asset').height('80%');
            $('#sign33_asset').height('80%');
            $('#sign41_asset').height('80%');
            $('#sign42_asset').height('80%');
            $('#sign43_asset').height('80%');
            $('#sign44_asset').height('80%');
        }
        else    {
            $('#sign11_asset').height('100%');
            $('#sign21_asset').height('100%');
            $('#sign22_asset').height('100%');
            $('#sign31_asset').height('100%');
            $('#sign32_asset').height('100%');
            $('#sign33_asset').height('100%');
            $('#sign41_asset').height('100%');
            $('#sign42_asset').height('100%');
            $('#sign43_asset').height('100%');
            $('#sign44_asset').height('100%');
        }
        $('#sign11_info').transition('scale');
        $('#sign21_info').transition('scale');
        $('#sign22_info').transition('scale');
        $('#sign31_info').transition('scale');
        $('#sign32_info').transition('scale');
        $('#sign33_info').transition('scale');
        $('#sign41_info').transition('scale');
        $('#sign42_info').transition('scale');
        $('#sign43_info').transition('scale');
        $('#sign44_info').transition('scale');
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
            }})
          .modal('show');
    });

    //Exit button
    $('#exit').click(function() {
        location.href="/inventory/";
    });

    socket.on('initialize', function (data) {
        if (log) console.log("Initialize !!");
        if (log) console.log(data);
        switch (data.numSigns)  {
            case 0:
                $('#noSign').transition('scale');
            break;

            case 1:
                if (1==data.signStatus[0])  $('#sign11_asset').css('background','rgba(76, 175, 80, 0.6)');
                $('#image11').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#sign11_info_label').html(data.sign[0].signType);
                $('#noSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#oneSign').transition('scale');
            break;

            case 2:
                if (1==data.signStatus[0])  $('#sign21_asset').css('background','rgba(76, 175, 80, 0.6)');
                if (1==data.signStatus[1])  $('#sign22_asset').css('background','rgba(76, 175, 80, 0.6)');
                $('#image21').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#image22').attr('src','/assets/'+data.sign[1].assetId+'.png');
                $('#sign21_info_label').html(data.sign[0].signType);
                $('#sign22_info_label').html(data.sign[1].signType);
                $('#noSign').transition('hide');
                $('#oneSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#twoSign').transition('scale');
            break;

            case 3:
                if (1==data.signStatus[0])  $('#sign31_asset').css('background','rgba(76, 175, 80, 0.6)');
                if (1==data.signStatus[1])  $('#sign32_asset').css('background','rgba(76, 175, 80, 0.6)');
                if (1==data.signStatus[2])  $('#sign33_asset').css('background','rgba(76, 175, 80, 0.6)');
                $('#image31').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#image32').attr('src','/assets/'+data.sign[1].assetId+'.png');
                $('#image33').attr('src','/assets/'+data.sign[2].assetId+'.png');
                $('#sign31_info_label').html(data.sign[0].signType);
                $('#sign32_info_label').html(data.sign[1].signType);
                $('#sign33_info_label').html(data.sign[2].signType);
                $('#noSign').transition('hide');
                $('#oneSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#threeSign').transition('scale');
            break;

            case 4:
                if (1==data.signStatus[0])  $('#sign41_asset').css('background','rgba(76, 175, 80, 0.6)');
                if (1==data.signStatus[1])  $('#sign42_asset').css('background','rgba(76, 175, 80, 0.6)');
                if (1==data.signStatus[2])  $('#sign43_asset').css('background','rgba(76, 175, 80, 0.6)');
                if (1==data.signStatus[3])  $('#sign43_asset').css('background','rgba(76, 175, 80, 0.6)');
                $('#image41').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#image42').attr('src','/assets/'+data.sign[1].assetId+'.png');
                $('#image43').attr('src','/assets/'+data.sign[2].assetId+'.png');
                $('#image44').attr('src','/assets/'+data.sign[3].assetId+'.png');
                $('#sign41_info_label').html(data.sign[0].signType);
                $('#sign42_info_label').html(data.sign[1].signType);
                $('#sign43_info_label').html(data.sign[2].signType);
                $('#sign44_info_label').html(data.sign[3].signType);
                $('#noSign').transition('hide');
                $('#oneSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#fourSign').transition('scale');
            break;

            default:
                    console.log("ERROR: unknown number of signs");
            }
        });

    socket.on('new_signs', function (data) {
        if (log) console.log("new_signs");
        if (log) console.log(data);
        switch (data.numSigns)  {
            case 0:
                $('#oneSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#noSign').transition('scale');
            break;
            case 1:
                $('#image11').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#sign11_info_label').html(data.sign[0].signType);
                $('#noSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#oneSign').transition('scale');
            break;

            case 2:
                $('#image21').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#image22').attr('src','/assets/'+data.sign[1].assetId+'.png');
                $('#sign21_info_label').html(data.sign[0].signType);
                $('#sign22_info_label').html(data.sign[1].signType);
                $('#noSign').transition('hide');
                $('#oneSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#twoSign').transition('scale');
            break;

            case 3:
                $('#image31').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#image32').attr('src','/assets/'+data.sign[1].assetId+'.png');
                $('#image33').attr('src','/assets/'+data.sign[2].assetId+'.png');
                $('#sign31_info_label').html(data.sign[0].signType);
                $('#sign32_info_label').html(data.sign[1].signType);
                $('#sign33_info_label').html(data.sign[2].signType);
                $('#noSign').transition('hide');
                $('#oneSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#fourSign').transition('hide');
                $('#threeSign').transition('scale');
            break;

            case 4:
                $('#image41').attr('src','/assets/'+data.sign[0].assetId+'.png');
                $('#image42').attr('src','/assets/'+data.sign[1].assetId+'.png');
                $('#image43').attr('src','/assets/'+data.sign[2].assetId+'.png');
                $('#image44').attr('src','/assets/'+data.sign[3].assetId+'.png');
                $('#sign41_info_label').html(data.sign[0].signType);
                $('#sign42_info_label').html(data.sign[1].signType);
                $('#sign43_info_label').html(data.sign[2].signType);
                $('#sign44_info_label').html(data.sign[3].signType);
                $('#noSign').transition('hide');
                $('#oneSign').transition('hide');
                $('#threeSign').transition('hide');
                $('#twoSign').transition('hide');
                $('#fourSign').transition('scale');
            break;

            default:
                console.log("ERROR: unknown number of signs :"+data.numSigns);
        }
    });

    socket.on('signStatus_update', function (data) {
        if (log) console.log("signStatus_update");
        if (log) console.log(data);
        if (1==data.status[0])  $('#sign11_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[0])  $('#sign21_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[1])  $('#sign32_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[0])  $('#sign31_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[1])  $('#sign32_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[2])  $('#sign33_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[0])  $('#sign41_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[1])  $('#sign42_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[2])  $('#sign43_asset').css('background','rgba(76, 175, 80, 0.6)');
        if (1==data.status[3])  $('#sign44_asset').css('background','rgba(76, 175, 80, 0.6)');
    });

    socket.on('sign_distance_update', function (data) {
        if (log) console.log("Sign distance update bVis_moreInfo: "+bVis_moreInfo);
        if (log) console.log(data);
        if (bVis_moreInfo)
        switch (data.length)  {
            case 1:
                $('#sign11_info_dist').html('Approx. '+data[0].toString()+' feet');
                $('#sign11_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
            break;
            case 2:
                $('#sign21_info_dist').html('Approx. '+data[0].toString()+' feet');
                $('#sign22_info_dist').html('Approx. '+data[1].toString()+' feet');
                $('#sign21_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
                $('#sign22_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
            break;
            case 3:
                $('#sign31_info_dist').html('Approx. '+data[0].toString()+' feet');
                $('#sign32_info_dist').html('Approx. '+data[1].toString()+' feet');
                $('#sign33_info_dist').html('Approx. '+data[0].toString()+' feet');
                $('#sign31_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
                $('#sign32_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
                $('#sign33_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
            break;
            case 4:
                $('#sign41_info_dist').html('Approx. '+data[0].toString()+' feet');
                $('#sign42_info_dist').html('Approx. '+data[1].toString()+' feet');
                $('#sign43_info_dist').html('Approx. '+data[2].toString()+' feet');
                $('#sign44_info_dist').html('Approx. '+data[3].toString()+' feet');
                $('#sign41_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
                $('#sign42_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
                $('#sign43_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
                $('#sign44_info_bar').progress('increment',Math.round((gpsRange-data[0])/gpsRange)*100);
            break;
            default:
                console.log("ERROR: unknown number of signs :");
        }
    });

    socket.on('rfid_reader_status', function (data) {
        if (log) console.log("Status : "+data.status);
        if('ACTIVE'==data.status)   {
            $('#status').html('Pause');
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
                blurring: true
            })
            .modal('show');
            $('.ui.active.centered.inline.loader').transition('hide');s
        }
        $('#status').removeClass('loading');
    });

    socket.on('gps_range_res', function (data) {
        if (log) console.log("GPS Range : "+data.val);
        gpsRange = Math.round(50*data.val);
        $('#gps_range').html(gpsRange.toString()+' feet&nbsp&nbsp');
    });
}