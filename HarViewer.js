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
    this.firstDate = null;
    this.waterfall = null;
    this.timesTh = null;
    this.details = null;
    this.request = null;
    this.requestList = null;
    this.response = null;
    this.responseList = null;
    this.timings = null;
    this.timingsList = null;
    this.actions = null;
    this.reload = null;
    this.displayWaterFall = null;
    this.displayDetails = null;

    this.currentEntryFocused = 0;

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
        $('#HarViewerSearch').click( this.onClickOnSearch );
        $('#HarViewerForm').focusout( this.onFocusOutSearch );

        this.actions = document.createElement('div');
        this.actions.id = 'HarViewerActions';
        $('#HarViewerForm').append(this.actions);
        this.reload = document.createElement('img');
        this.reload.id = 'HarViewerReload';
        this.reload.src = 'reload.png';
        $('#'+this.actions.id).append(this.reload);
        $('#'+this.reload.id).outerHeight($('#'+this.search.id).outerHeight());
        $('#'+this.reload.id).click(function(event){
            viewer.showedEntries = new Array();
            for (var i = 0; i < viewer.entriesSummaries.length; i++) {
                viewer.showedEntries.push(viewer.entriesSummaries[i]);
            }
            viewer.initTime();
            viewer.initTable();
            viewer.initWaterFallView();
            viewer.hideDetails();
            viewer.showWaterFall();
        })
        this.displayWaterFall = document.createElement('img');
        this.displayWaterFall.id = 'HarViewerDisplayWaterFall';
        this.displayWaterFall.src = 'displayWaterFall.png';
        $('#'+this.actions.id).append(this.displayWaterFall);
        $('#'+this.displayWaterFall.id).outerHeight($('#'+this.search.id).outerHeight());
        $('#'+this.displayWaterFall.id).click(function(event){
            viewer.hideDetails();
            viewer.showWaterFall();
        })
        this.displayDetails = document.createElement('img');
        this.displayDetails.id = 'HarViewerDisplayDetails';
        this.displayDetails.src = 'displayDetails.png';
        $('#'+this.actions.id).append(this.displayDetails);
        $('#'+this.displayDetails.id).outerHeight($('#'+this.search.id).outerHeight());
        $('#'+this.displayDetails.id).click(function(event){
            viewer.hideWaterFall();
            viewer.showDetails();
        })

        var width = $('#'+this.reload.id).outerWidth(true) + $('#'+this.displayWaterFall.id).outerWidth(true) + $('#'+this.displayDetails.id).outerWidth(true);
        $('#'+this.actions.id).outerWidth(width);
        $('#HarViewerForm').outerWidth($('#HarViewer').outerWidth());
        $('#HarViewerForm').height($('#'+this.search.id).outerHeight());
        $('#HarViewerSearch').css('border-radius',($('#HarViewerSearch').outerHeight()/2));
        $('#HarViewerSearch').css('border-color','#000000');
        $('#HarViewerSearch').css('border-width',0);
        $('#HarViewerSearch').css('border-style','solid');
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


        this.initTime();
        this.initTable();
        this.initWaterFallView();
        this.showWaterFall();

        this.initDetails();
        this.hideDetails();
        this.currentEntryFocused = null;
        $('#HarViewerContent').height($('#HarViewerLeftPanel').outerHeight(true));
        $('#HarViewerContent').outerWidth($('#HarViewerForm').outerWidth(true));
        $('#HarViewerRightPanel').outerWidth($('#HarViewerLeftPanel').outerWidth(true));
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
            filter.id = 'HarViewerFilters_'+i;
            filter.innerHTML = this.listFilters[i];
            $('#HarViewerFilters').append(filter);
            $('#'+filter.id).addClass(filter.id);
            $('#'+filter.id).addClass('HarViewerFilters'+this.listFilters[i]);
            $('#'+filter.id).click(this.onFilter);

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
                Timings: this.entries[i].timings,
                date: new Date(this.entries[i].startedDateTime).valueOf()
            };
            delete entry.Timings.comment;
            this.showedEntries.push(entry);
            this.entriesSummaries.push(entry);
        }

    }

    this.initTime = function(){

        var a = this.showedEntries[0].date;
        var b = 0;
        var c = 0;
        for (var i = 0; i < this.showedEntries.length; i++) {
            if (this.showedEntries[i].date < a) {
                a = this.showedEntries[i].date;
            }
            if (this.showedEntries[i].date >= b) {
                if (this.showedEntries[i].date == b) {
                    c = Math.max(this.showedEntries[i].Time,c);
                } else {
                    c = this.showedEntries[i].Time;
                }
                b = this.showedEntries[i].date;
            }
        }
        this.time = (b-a)+c;
        this.firstDate = a;
    }

    this.initEntriesRows = function(){

        for (var i = 0; i < this.showedEntries.length; i++) {

            var entry = this.showedEntries[i];

            var row = document.createElement('div');
            row.id = 'HarViewerRow_'+i;

            $('#HarViewerTable').append(row);
            $('#HarViewerRow_'+i).addClass('HarViewerTableTd');
            if (i%2 == 0) {
                $('#HarViewerRow_'+i).css('background-color','#FFFFFF');
            } else {
                $('#HarViewerRow_'+i).css('background-color','#F2F2F2');
            }

            for (var j = 0; j < this.listFilters.length; j++) {
                this.listFilters[j]
                var field = document.createElement('div');
                field.id = 'HarViewerRow_'+this.listFilters[j]+'_'+i;
                if (this.listFilters[j] == 'URL') {
                    field.innerHTML = '<a href="'+entry[this.listFilters[j]]+'" title="'+entry[this.listFilters[j]]+'" class="tooltip" >'+entry[this.listFilters[j]]+'</a>';
                } else {

                    field.innerHTML = '<p title="'+entry[this.listFilters[j]]+'" class="tooltip">'+entry[this.listFilters[j]]+'</p>';

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
        $('#HarViewerTimeTh').height($('#HarViewerFilters').height());

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
            beginAt = $('#HarViewerWaterFall').width() * (entry.date - this.firstDate) / this.time;
            $('#HarViewerWaterFallRow_'+i).css('padding-left',beginAt);
            $('#HarViewerWaterFallRow_'+i).outerHeight($('#HarViewerRow_0').outerHeight());
            if (i%2 == 0) {
                $('#HarViewerWaterFallRow_'+i).css('background-color','#FFFFFF');
            } else {
                $('#HarViewerWaterFallRow_'+i).css('background-color','#F2F2F2');
            }

            allTimingsBlock = document.createElement('div');
            allTimingsBlock.id = 'HarViewerWaterFallRowAllTiming_'+i;
            allTimingsBlock.title = '';

            for ( timing in entry.Timings ) {
                value = entry.Timings[timing];
                console.log(value);

                allTimingsBlock.title = allTimingsBlock.title+timing+' : '+value+'\n';
            }

            $('#HarViewerWaterFallRow_'+i).append(allTimingsBlock);
            $('#HarViewerWaterFallRowAllTiming_'+i).addClass('HarViewerAllTimingBlock');
            $('#HarViewerWaterFallRowAllTiming_'+i).addClass('tooltip');

            for ( timing in entry.Timings ) {

                value = entry.Timings[timing];
                var block = document.createElement('div');
                block.id = 'HarViewerWaterFallRow_'+timing+'_'+i;
                block.alt = value;
                $('#HarViewerWaterFallRowAllTiming_'+i).append(block);
                var classTiming = timing.substring(0,1).toUpperCase()+timing.substring(1);
                $('#HarViewerWaterFallRow_'+timing+'_'+i).addClass('HarViewerTiming'+classTiming);
                $('#HarViewerWaterFallRow_'+timing+'_'+i).addClass('HarViewerTimingBlock');
                var blockWidth = width * value / this.time;
                $('#HarViewerWaterFallRow_'+timing+'_'+i).outerWidth((blockWidth));
                //trWidth = trWidth + $('#HarViewerWaterFallRow_'+timing+'_'+i).outerWidth();


            }

            //beginAt = trWidth + beginAt;

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

        $('#HarViewerDetails').outerHeight( $('#HarViewerTable').outerHeight(true) );

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
        viewer.initTime();
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

            if (index%2 == 0) {
                $('#HarViewerWaterFallRow_'+index).css('background-color','#FFFFFF');
                $('#HarViewerRow_'+index).css('background-color','#FFFFFF');
            } else {
                $('#HarViewerWaterFallRow_'+index).css('background-color','#F2F2F2');
                $('#HarViewerRow_'+index).css('background-color','#F2F2F2');
            }
        } else {
            if (viewer.currentEntryFocused%2 == 0) {
                $('#HarViewerWaterFallRow_'+viewer.currentEntryFocused).css('background-color','#FFFFFF');
                $('#HarViewerRow_'+viewer.currentEntryFocused).css('background-color','#FFFFFF');
            } else {
                $('#HarViewerWaterFallRow_'+viewer.currentEntryFocused).css('background-color','#F2F2F2');
                $('#HarViewerRow_'+viewer.currentEntryFocused).css('background-color','#F2F2F2');
            }
            viewer.currentEntryFocused = index;
            viewer.initDetails();
            viewer.hideWaterFall();
            viewer.showDetails();
            $('#HarViewerWaterFallRow_'+index).css('background-color', '#FFA07A');
            $('#HarViewerRow_'+index).css('background-color', '#FFA07A');
        }
    }

    this.onFilter = function(event){

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

        viewer.showedEntries.sort(function(a,b){
            return viewer.compareTwoEntries(a,b,viewer.listFilters[no]);
        })

        viewer.initTime();
        viewer.initTable();
        viewer.initWaterFallView();



    }

    this.compareTwoEntries = function(a,b,attr){
        var ret = 0;
        if (a[attr] > b[attr]) {
            ret = 1;
        } else if (a[attr] < b[attr]){
            ret = -1;
        }
        return ret;
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
