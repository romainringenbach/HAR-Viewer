function HarViewer(){

    var viewer = this;

    this.entriesSummaries = new Array();
    this.showedEntries = new Array();

    this.form = null;
    this.search = null;
    this.content = null;
    this.left = null;
    this.right = null;
    this.table = null;
    this.listFilters = ['Name','URL','Method','Status','Type','Size','Time'];
    this.filters = null;
    this.time = null;
    this.waterfall = null;
    this.timesTh = null;
    this.details = null;
    this.request = null;
    this.requestList = null;
    this.response = null;
    this.responseList = null;
    this.timings = null;
    this.timingsList = null;

    this.currentEntryFocused = null;

    this.loadHar = function(har){
        this.entriesSummaries = new Array();
        this.har = har;
        this.entries = parseHar(har);
        this.initEntriesSummaries();

        this.initSearchBar();
        this.initLeftRight();

    }

    this.initSearchBar = function(){

        this.form = document.createElement('form');
        this.form.id = 'HarViewerForm';
        this.search = document.createElement('input');
        this.search.type = 'text';
        this.search.value = 'Search...';
        this.search.id = 'HarViewerSearch';

        $('#HarViewer').append(this.form);
        $('#HarViewerForm').append(this.search);
        $('#HarViewerForm').keypress( this.onSearch );
        $('#HarViewerForm').click( this.onClickOnSearch );
        $('#HarViewerForm').focusout( this.onFocusOutSearch );

    }

    this.initLeftRight = function(){

        this.content = document.createElement('div');
        this.content.id = 'HarViewerContent';
        $('#HarViewer').append(this.content);

        this.left = document.createElement( 'div' );
        this.left.id = 'HarViewerLeftPanel';
        $('#HarViewerContent').append(this.left);
        $('#HarViewerLeftPanel').css('float','left');

        this.right = document.createElement( 'div' );
        this.right.id = 'HarViewerRightPanel';
        $('#HarViewerContent').append(this.right);
        $('#HarViewerRightPanel').css('float','right');

        this.initTable();
        this.initWaterFallView();
        this.showWaterFall();

    }

    this.initTable = function(){

        if ($('#HarViewerTable').length){
            $('#HarViewerTable').remove();
        }

        this.table = document.createElement( 'div' );
        this.table.id = 'HarViewerTable';

        $('#HarViewerLeftPanel').append(this.table);

        this.initFilterBar();

    }

    this.initFilterBar = function(){


        this.filters = document.createElement( 'div' );
        this.filters.id = 'HarViewerFilters';
        $('#HarViewerTable').append(this.filters);

        for (var i = 0; i < this.listFilters.length; i++) {

            var filter = document.createElement( 'div' );
            filter.id = 'HarViewerFilters'+this.listFilters[i];
            filter.innerHTML = this.listFilters[i];
            $('#HarViewerFilters').append(filter);
            $('#'+filter.id).addClass(filter.id);


        }

        this.initEntriesRows();

    }

    this.initEntriesSummaries = function(){

        this.time = 0;

        for (var i = 0; i < this.entries.length; i++) {

            // beautify the url to make a name of the resources

            var url = this.entries[i].request.url;

            var c = 0;
            var find = false;
            for (var j = url.length - 1; (j >= 0 && !find); j--) {
                if(url[j] == '/'){
                    c = j;
                    find = true;
                }

            }

            var name = url.substring(c);

            // beautify the type

            var brutType = this.entries[i].response.content.mimeType;
            var d = 0;
            find = false;
            for (var j = 0; (j < brutType.length && !find); j++) {
                if(brutType[j] == ';'){
                    d = j;
                    find = true;
                }

            }
            var type = brutType.substring(0,d);
            if (!find) {
                type = brutType;
            }

            entry = {
                Name: name,
                URL: this.entries[i].request.url,
                Method: this.entries[i].request.method,
                Status: this.entries[i].response.status,
                Type: type,
                Size: this.entries[i].response.content.size,
                Time: this.entries[i].time,
                Timings: this.entries[i].timings
            };
            this.time = this.time + entry.Time;
            this.showedEntries.push(entry);
            this.entriesSummaries.push(entry);
        }


    }

    this.initEntriesRows = function(){

        for (var i = 0; i < this.showedEntries.length; i++) {

            var entry = this.showedEntries[i];

            var row = document.createElement('div');
            row.id = 'HarViewerRow_'+i;

            $('#HarViewerTable').append(row);
            $('#HarViewerRow_'+i).addClass('HarViewerTableTd');

            for (var j = 0; j < this.listFilters.length; j++) {
                this.listFilters[j]
                var field = document.createElement('div');
                field.id = 'HarViewerRow_'+this.listFilters[j]+'_'+i;
                if (this.listFilters[j] == 'URL') {
                    field.innerHTML = '<a href="'+entry[this.listFilters[j]]+'">'+entry[this.listFilters[j]]+'</a>';
                } else {

                    field.innerHTML = entry[this.listFilters[j]];

                }


                $('#HarViewerRow_'+i).append(field);

                if (this.listFilters[j] != 'URL') {
                    $('#HarViewerRow_'+this.listFilters[j]+'_'+i).click( this.onEntry );
                }

                $('#'+field.id).addClass('HarViewerFilters'+this.listFilters[j]);
            }
        }
    }

    this.initWaterFallView = function(){

        if ($('#HarViewerWaterFall').length){
            $('#HarViewerWaterFall').remove();
        }

        this.waterfall = document.createElement( 'div' );
        this.waterfall.id = 'HarViewerWaterFall';

        $('#HarViewerRightPanel').append(this.waterfall);

        this.initWaterFallHeader();
        this.showWaterFall();

    }

    this.initWaterFallHeader = function(){

        this.timesTh = document.createElement('div');
        this.timesTh.id = 'HarViewerTimeTh';

        $('#HarViewerWaterFall').append(this.timesTh);
        $('#HarViewerTimeTh').height($('#HarViewerRow_0').height());

        var divTime = Math.floor(this.time / 10);

        for (var i = 0; i < 10; i++) {

            var timeDiv = document.createElement('div');
            timeDiv.id = 'HarViewerTimeTh_'+i;
            timeDiv.innerHTML = divTime*i+'ms';
            $('#HarViewerTimeTh').append(timeDiv);
            $('#'+timeDiv.id).addClass('HarViewerTimeHeader');
        }

        this.initWaterFallRows();
    }

    this.initWaterFallRows = function(){

        var beginAt = 0;

        for (var i = 0; i < this.showedEntries.length; i++) {

            var entry = this.showedEntries[i];



            var row = document.createElement('div');
            row.id = 'HarViewerWaterFallRow_'+i;

            $('#HarViewerWaterFall').append(row);
            var width = $('#HarViewerWaterFall').width();
            var trWidth = 0
            $('#HarViewerWaterFallRow_'+i).addClass('HarViewerWaterFallRow');
            $('#HarViewerWaterFallRow_'+i).css('padding-left',beginAt);
            $('#HarViewerWaterFallRow_'+i).height($('#HarViewerRow_0').height());

            for ( timing in entry.Timings ) {

                value = entry.Timings[timing];
                var block = document.createElement('div');
                block.id = 'HarViewerWaterFallRow_'+timing+'_'+i;
                block.alt = value;
                $('#HarViewerWaterFallRow_'+i).append(block);
                var classTiming = timing.substring(0,1).toUpperCase()+timing.substring(1);
                $('#HarViewerWaterFallRow_'+timing+'_'+i).addClass('HarViewerTiming'+classTiming);
                $('#HarViewerWaterFallRow_'+timing+'_'+i).addClass('HarViewerTimingBlock');
                var blockWidth = width * value / this.time;
                $('#HarViewerWaterFallRow_'+timing+'_'+i).width((blockWidth*0.80));
                trWidth = trWidth + $('#HarViewerWaterFallRow_'+timing+'_'+i).width();


            }

            beginAt = trWidth + beginAt;

        }

    }

    this.initDetails = function(){

        var responseHeader = ['Server','Date','Content-Type','Last-Modified','Transfer-Encoding','Connection','Vary','Content-Encoding'];
        var requestHeader = ['Host','Accept','Referer','Accept-Encoding','Accept-Language','User-Agent','Cache-Control'];
        var timings = ['blocked','dns','connect','send','wait','receive','ssl','comment'];

        if ($('#HarViewerDetails').length){
            $('#HarViewerDetails').remove();
        }

        this.details = document.createElement( 'div' );
        this.details.id = 'HarViewerDetails';

        $('#HarViewerRightPanel').append(this.details);

        this.request = document.createElement( 'div' );
        this.request.id = 'HarViewerDetailsRequest';
        this.request.innerHTML = '<p>Request</p>';
        $('#HarViewerDetails').append(this.request);
        this.requestList = document.createElement( 'ul' );
        this.requestList.id = 'HarViewerDetailsRequestList';
        $('#HarViewerDetailsRequest').append(this.requestList);

        var entry = this.entriesSummaries[this.currentEntryFocused];
        var entryComplete = this.entries[this.currentEntryFocused];

        var entryRequestList = {};

        for (i = 0; i < entryComplete.request.headers.length; i++) {

            for (j = 0; j < requestHeader.length; j++) {
                console.log(entryComplete.request.headers[i].name);
                if (entryComplete.request.headers[i].name == requestHeader[j]){
                    entryRequestList[requestHeader[j]] = entryComplete.request.headers[i].value;
                }
            }
        }

        for (i = 0; i < requestHeader.length ; i++){

            var li = document.createElement('li');
            li.innerHTML = '<li><p><strong>'+requestHeader[i]+'</strong> : '+entryRequestList[requestHeader[i]]+'</p>';
            $('#HarViewerDetailsRequestList').append(li);
        }

        this.response = document.createElement( 'div' );
        this.response.id = 'HarViewerDetailsResponse';
        this.response.innerHTML = '<p>Response</p>';
        $('#HarViewerDetails').append(this.response);
        this.responseList = document.createElement( 'ul' );
        this.responseList.id = 'HarViewerDetailsResponseList';
        $('#HarViewerDetailsResponse').append(this.responseList);

        var entryResponseList = {};

        for (i = 0; i < entryComplete.response.headers.length; i++) {

            for (j = 0; j < responseHeader.length; j++) {
                if (entryComplete.response.headers[i].name == responseHeader[j]){
                    entryResponseList[responseHeader[j]] = entryComplete.response.headers[i].value;
                }
            }
        }

        for (i = 0; i < responseHeader.length ; i++){

            var li = document.createElement('li');
            li.innerHTML = '<li><p><strong>'+responseHeader[i]+'</strong> : '+entryResponseList[responseHeader[i]]+'</p>';
            $('#HarViewerDetailsResponseList').append(li);


        }

        this.timings = document.createElement( 'div' );
        this.timings.id = 'HarViewerDetailsTimings';
        this.timings.innerHTML = '<p>Timings</p>';
        $('#HarViewerDetails').append(this.timings);
        this.timingsList = document.createElement( 'ul' );
        this.timingsList.id = 'HarViewerDetailsTimingsList';
        $('#HarViewerDetailsTimings').append(this.timingsList);

        var entryTimingsList = entry.Timings

        for (i = 0; i < timings.length ; i++){

            var li = document.createElement('li');
            li.innerHTML = '<li><p><strong>'+timings[i]+'</strong> : '+entryTimingsList[timings[i]]+'</p>';
            $('#HarViewerDetailsTimingsList').append(li);


        }

    }

    this.showDetails = function(){
        $('#HarViewerDetails').css( 'display', 'block' );
    }

    this.showWaterFall = function(){
        $('#HarViewerWaterFall').css( 'display', 'block' );
    }

    this.hideDetails = function(){
        $('#HarViewerDetails').css( 'display', 'none' );
    }

    this.hideWaterFall = function(){
        $('#HarViewerWaterFall').css( 'display', 'none' );
    }

    this.onClickOnSearch = function(event){
        $('#HarViewerSearch').prop( 'value' , '');
    }

    this.onFocusOutSearch = function(event){
        $('#HarViewerSearch').prop( 'value' , 'Search...');
    }

    this.onSearch = function(event){
        var str = $('#HarViewerSearch').prop( 'value' );
        viewer.showedEntries = new Array();

        for (var i = 0; i < viewer.entriesSummaries.length; i++) {
            var entry = viewer.entriesSummaries[i]
            var find = false;
            for (var j = 0; (j < viewer.listFilters.length && !find); j++) {
                if (entry[viewer.listFilters[j]].toString().includes(str)) {
                    find = true;
                }
            }
            if (find) {
                viewer.showedEntries.push(entry);
            }

        }

        viewer.initTable();
        viewer.initWaterFallView();

    }

    this.onEntry = function(event){
        var id = event.currentTarget.id;

        var c = 0;
        var find = false;
        for (var j = id.length - 1; (j >= 0 && !find); j--) {
            if(id[j] == '_'){
                c = j;
                find = true;
            }

        }

        var no = id.substring((c+1));
        var index = no.valueOf();
        if (index == viewer.currentEntryFocused) {
            viewer.hideDetails();
            viewer.showWaterFall();
            viewer.currentEntryFocused = null;
        } else {
            viewer.currentEntryFocused = index;
            viewer.initDetails();
            viewer.hideWaterFall();
            viewer.showDetails();
        }
    }
}

function parseHar(har){

    var entries = har.log.entries;
    entries.sort(compareEntries);

    return entries;
}

function compareEntries(a,b){

    dateA = new Date(a.startedDateTime)
    dateB = new Date(b.startedDateTime)
    return dateA.valueOf() - dateB.valueOf();

}
