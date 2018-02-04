var configCurr;
var configFreq;
var configCurrList;
var cryptoCurrencyMapping = {};
var currencySymbolMapping = {
    'USD': '$',
    'AUD': '$',
    'EUR': '€',
    'GBP': '£',
    'BRL': 'R$',
    'CAD': '$',
    'CHF': '₣',
    'CLP': '$',
    'CNY': '¥',
    'CZK': 'Kč',
    'DKK': 'kr',
    'HKD': '$',
    'HUF': 'Ft',
    'IDR': 'Rp',
    'ILS': '₪',
    'INR': '₨',
    'JPY': '¥',
    'KRW': '₩',
    'MXN': '$',
    'MYR': 'RM',
    'NOK': 'kr',
    'NZD': '$',
    'PHP': '₱',
    'PKR': '₨',
    'PLN': 'zł',
    'RUB': 'р.',
    'SEK': 'kr',
    'SGD': '$',
    'THB': '฿',
    'TRY': '₤',
    'TWD': '$',
    'ZAR': 'R'
};

function init() {
    System.Gadget.settingsUI = 'settings.html';
    System.Gadget.onSettingsClosed = init;

    configDisplayValue = readSetting('configDisplayValue', 'true');
    configCurr = readSetting('configCurr', 'USD');
    configFreq = readSetting('configFreq', '20');
    configCurrList = readSetting('configCurrList', 'BTC,BCH,LTC,ETH').split(',');

    createTableBody();

    var tableHeight = $('#main-table').outerHeight();
    var offset = 30;

    document.body.style.height = (tableHeight + offset);
    document.body.style.margin = 0;

    if (configDisplayValue == 'false') {
        document.body.style.width = 305;
        $('#main').css('width', '300px');
        $('#main-table').css('width', '300px');
        $('#meta-container').css('width', '295px');

        if (!isUpToDateResults) {
            $('#out-of-date').css('text-align', 'right');
            $('#meta-data').hide();
        } else {
            $('#out-of-date').css('width', '0');
        }
    } else {
        document.body.style.width = 405;
        $('#main').css('width', '400px');
        $('#main-table').css('width', '400px');
        $('#meta-container').css('width', '395px');
        $('#out-of-date').css('width', '100px');
        $('#out-of-date').css('text-align', 'left');
        $('#meta-data').show();
    }

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
            cryptoCurrencyMapping[val.symbol] = val.id;
        });

        for (var i = 0; i < configCurrList.length; i++) {
            getPrice(configCurrList[i]);
        }
    });
}

function getPrice(code) {
    // Docs: https://coinmarketcap.com/api/
    //
    if (code) {
        $.getJSON('https://api.coinmarketcap.com/v1/ticker/' + cryptoCurrencyMapping[code] + '/?convert=' + configCurr, function(data) {
            var changeDirection = (data[0].percent_change_1h < 0) ? 'decrease' : 'increase';
            var configHoldingValue = (readSetting('configHoldList-' + code, '0') * 1);
            var price = (data[0]['price_' + configCurr.toLowerCase()] * 1);
            var priceFormatted = formatCurrency(data[0]['price_' + configCurr.toLowerCase()]);
            var holdingsValueFormatted = formatCurrency(price * configHoldingValue);

            document.getElementById(code).className = 'stock ' + changeDirection;
            document.getElementById(code + '-pctChange').innerHTML = data[0].percent_change_1h + '%';
            document.getElementById(code + '-myPrice').innerHTML = priceFormatted;
            document.getElementById(code + '-port').innerHTML = holdingsValueFormatted;
            document.getElementById('last-updated').innerHTML = formatTimestamp(data[0].last_updated);
            document.getElementById('last-refreshed').innerHTML = getTimeNow();
        });

        // Callback to repeatedly get and update the price
        setTimeout(function() {
            getPrice(code);
        }, configFreq * 60000);
    }
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
    var tableHeaders = document.getElementById('main-table').getElementsByTagName('th');
    var tableBody = document.getElementById('main-table').getElementsByTagName('tbody')[0];
    var rows = tableBody.rows;

    if (configDisplayValue == 'false') {
        tableHeaders[3].style.display = 'none';
    } else {
        tableHeaders[3].style.display = 'block';
    }

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

        if (configDisplayValue == 'false') {
            cell5.style.display = 'none';
        }
    }

    altRows();
}

function formatTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
}

function getTimeNow() {
    var date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
}

function formatCurrency(number) {
    return currencySymbolMapping[configCurr] + (number * 1).toLocaleString(undefined, { style: 'currency', currency: configCurr });
}
