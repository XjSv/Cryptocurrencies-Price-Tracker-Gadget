currencyMapping = {};
offset = 30;

function init() {
    System.Gadget.settingsUI       = 'settings.html';
    System.Gadget.onSettingsClosed = init;

    configCurr     = (System.Gadget.Settings.readString('configCurr') || 'USD');
    configFreq     = (System.Gadget.Settings.readString('configFreq') || 20);
    configCurrList = (System.Gadget.Settings.readString('configCurrList') || 'BTC,BCH,LTC,ETH').split(',');

    createTableBody();

    var tableHeight = $('#main-table').outerHeight();

    document.body.style.width  = 405;
    document.body.style.height = (tableHeight + offset);
    document.body.style.margin = 0;

    $('#main').css('height', (tableHeight + offset) + 'px');
    $('.currency-label').html('(' + configCurr + ')');
    $('#refresh-frequency').html(configFreq);

    getList();
}

function getList() {
    // Docs: https://coinmarketcap.com/api/
    //
    $.getJSON('https://api.coinmarketcap.com/v1/ticker', function(data) {
        $.each(data, function(key, val) {
            currencyMapping[val.symbol] = val.id;
        });

        for (var i = 0; i < configCurrList.length; i++) {
            getPrice(configCurrList[i]);
        }
    });
}

function getPrice(code, index) {
    // Docs: https://coinmarketcap.com/api/
    //
    $.getJSON('https://api.coinmarketcap.com/v1/ticker/' + currencyMapping[code] + '/?convert=' + configCurr, function(data) {
        var changeDirection = (data[0].percent_change_1h < 0) ? 'decrease' : 'increase';
        var configHoldingValue = ((System.Gadget.Settings.readString('inputHoldList-' + code) || 0) * 1);
        var price = (data[0]['price_' + configCurr.toLowerCase()] * 1);
        var priceFormatted = formatCurrency(data[0]['price_' + configCurr.toLowerCase()]);
        var holdingsValueFormatted = formatCurrency(price * configHoldingValue);

        document.getElementById(code).className = 'stock ' + changeDirection;
        document.getElementById(code + '-pctChange').innerHTML = data[0].percent_change_1h + '%';
        document.getElementById(code + '-myPrice').innerHTML = priceFormatted;
        document.getElementById(code + '-port').innerHTML    = holdingsValueFormatted;
        document.getElementById('last-updated').innerHTML = formatTimestamp(data[0].last_updated);

    });

    // Callback to repeatedly get and update the price
    setTimeout('getPrice(' + code + ')', configFreq * 60000);
}

function altRows() {
    var tableElement = document.getElementsByTagName('table');
    for (var j = 0; j < tableElement.length; j++) {
        var table = tableElement[j];
        var rows = table.getElementsByTagName('tr');

        for (var i = 0; i < rows.length; i++) {
            if (i % 2 == 0) {
                rows[i].style.backgroundColor = '#1e1e1e';
                rows[i].style.color = '#cbcbcb';
            } else {
                rows[i].style.backgroundColor = '#818181';
            }
        }
    }
}

function createTableBody() {
    var tableBody = document.getElementById('main-table').getElementsByTagName('tbody')[0];
    var rows = tableBody.rows;

    // Delete all rows first before inserting new ones.
    while (tableBody.rows.length > 0) {
        tableBody.deleteRow(0);
    }

    for (var i = 0; i < configCurrList.length; i++) {
        var rowIndex = (rows == null) ? 0 : rows.length;

        var row = tableBody.insertRow(rowIndex);
        row.className = 'stock';
        row.id = configCurrList[i];

        var cell1 = row.insertCell(0);
        cell1.className = 'name'
        cell1.innerHTML = configCurrList[i];

        var cell2 = row.insertCell(1);
        cell2.className = 'value';
        cell2.id = configCurrList[i] + '-myPrice';

        var cell4 = row.insertCell(2);
        cell4.className = 'percentage';
        cell4.id = configCurrList[i] + '-pctChange';

        var cell5 = row.insertCell(3);
        cell5.className = 'portfolio';
        cell5.id = configCurrList[i] + '-port';
    }

    altRows();
}

function formatTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    date.setDate(date.getDate() - 1);
    return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' '
    + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
}

function formatCurrency(number) {
    return (number * 1).toLocaleString(undefined, { style: 'currency', currency: configCurr });
}