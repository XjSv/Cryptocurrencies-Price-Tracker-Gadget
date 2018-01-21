currencies = {};

function init() {
    var configCurr     = (System.Gadget.Settings.readString('configCurr') || 'USD');
    var configFreq     = (System.Gadget.Settings.readString('configFreq') || 20);
    var configCurrList = (System.Gadget.Settings.readString('configCurrList') || 'BTC,BCH,LTC,ETH');

    $('#inputCurr').val(configCurr);
    $('#inputFreq').val(configFreq);

    getCurrencyList(configCurrList.split(','));

    $('#inputCurrList').change(function() {
        generateHoldingsInputs($(this).val());
    });

    $('#currency-holdings').on('change', '.inputHoldList', function() {
        System.Gadget.Settings.writeString('inputHoldList-' + $(this).attr('id'), $(this).val());
    });

    System.Gadget.onSettingsClosing = saveSettings;
}

function saveSettings(event) {
    if (event.closeAction == event.Action.commit) {
        System.Gadget.Settings.writeString('configCurr',     $('#inputCurr').val());
        System.Gadget.Settings.writeString('configFreq',     $('#inputFreq').val());
        System.Gadget.Settings.writeString('configCurrList', $('#inputCurrList').val());

        event.cancel = false;
    }
}

function generateHoldingsInputs(selectedOptions) {
    var holdingsInputs = '';
    $.each(selectedOptions, function(key, val) {
        var elementValue = (System.Gadget.Settings.readString('inputHoldList-' + val) || '0');
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
