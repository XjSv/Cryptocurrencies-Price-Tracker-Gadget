currencies = {};

function init() {
    var configDisplayValue = readSetting('configDisplayValue', 'true');
    var configCurr = readSetting('configCurr', 'USD');
    var configFreq = readSetting('configFreq', '20');
    var configCurrList = readSetting('configCurrList', 'BTC,BCH,LTC,ETH');

    if (configDisplayValue == 'true') {
        $('#inputDisplayValue').attr('checked', true);
    } else {
        $('#inputDisplayValue').removeAttr('checked');
        $('#current-holdings').hide();
    }

    $('#inputCurr').val(configCurr);
    $('#inputFreq').val(configFreq);

    getCurrencyList(configCurrList.split(','));

    $('#inputCurrList').change(function() {
        generateHoldingsInputs($(this).val());
    });

    $('#inputDisplayValue').change(function() {
        if ($(this).is(':checked')) {
            $('#current-holdings').show();
        } else {
            $('#current-holdings').hide();
        }
    });

    $('#currency-holdings').on('keyup', '.inputHoldList', function() {
        this.value = this.value.replace(/[^0-9\.]/g, '');
    });

    System.Gadget.onSettingsClosing = saveSettings;
}

function saveSettings(event) {
    if (event.closeAction == event.Action.commit) {

        if ($('#inputDisplayValue').is(":checked")) {
            saveSetting('configDisplayValue', 'true');
        } else {
            saveSetting('configDisplayValue', 'false');
        }

        saveSetting('configCurr', $('#inputCurr').val());
        saveSetting('configFreq', $('#inputFreq').val());
        saveSetting('configCurrList', $('#inputCurrList').val());

        $('.inputHoldList').each(function() {
            saveSetting('configHoldList-' + $(this).attr('id'), ($(this).val() * 1));
        });

        event.cancel = false;
    }
}

function generateHoldingsInputs(selectedOptions) {
    var holdingsInputs = '';
    $.each(selectedOptions, function(key, val) {
        var elementValue = readSetting('configHoldList-' + val, '0');
        holdingsInputs += val + ': <input name="inputHoldList-' + val + '" id="' + val + '" class="inputHoldList" type="text" size="3" value="' + elementValue + '" align="right" /><br />';
    });
    $('#currency-holdings').html(holdingsInputs);
}

function getCurrencyList(configCurrList) {
    // Docs: https://coinmarketcap.com/api/
    //
    $.getJSON("https://api.coinmarketcap.com/v1/ticker", function(data) {
        var selectOptions = [];
        $.each(data, function(key, val) {
            selectOptions.push('<option value="'+val.symbol+'">'+val.name+'</option>');
        });

        $('#inputCurrList').html(selectOptions);
        $('#inputCurrList').val(configCurrList);
        generateHoldingsInputs(configCurrList);
    });
}
