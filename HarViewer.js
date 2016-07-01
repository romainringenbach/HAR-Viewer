/**
 *  id : id of the div where the view will be deploy
 *  additionnalSeparators : Array list of :
 *  {
 *      name : name,
 *      value : value,
 *      color : color
 *  }
 *
 */

function HarViewer(id,additionnalIndicators){
    var viewer = this;
    this.id = id;
    this.entriesSummaries = new Array();
    this.showedEntries = new Array();

    this.indicators = new Array();
    if (additionnalIndicators) {

        for (var i = 0; i < additionnalSeparators.length; i++) {
            this.indicators.push(addtionnalIndicator[i]);
        }

    }

    this.form = null;
    this.search = null;
    this.content = null;
    this.left = null;
    this.right = null;
    this.table = null;
    this.listFilters = ['Name','URL','Method','Status','Type','Size','Time'];
    this.responseHeader = ['Server','Date','Content-Type','Last-Modified','Transfer-Encoding','Connection','Vary','Content-Encoding'];
    this.requestHeader = ['Host','Accept','Referer','Accept-Encoding','Accept-Language','User-Agent','Cache-Control'];
    this.entryTimings = ['blocked','dns','connect','send','wait','receive'];
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
    this.buttons = null;
    this.reload = null;
    this.displayWaterFall = null;
    this.displayDetails = null;
    this.firstDetails = true;
    this.currentEntryFocused = 0;

    this.colorPairRow = '#FFFFFF';
    this.colorUnpairRow = '#F2F2F2';
    this.colorHighlightRow = '#FFA07A';
    this.colorIndicatorOnload = '#DC143C';

    this.loadHar = function(har){
        this.entriesSummaries = new Array();
        this.har = har;
        this.entries = parseHar(har);
        this.initEntriesSummaries();

        this.initFrontEnd();

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

    this.initFrontEnd = function(){

        this.initForm();
        this.initLeftRight();

    }

    this.initButtonReload = function(){
        this.reload = document.createElement('img');
        this.reload.id = 'HarViewerReload';
        this.reload.src = 'reload.png';
        $('#'+this.buttons.id).append(this.reload);
        $('#'+this.reload.id).outerHeight($('#'+this.search.id).outerHeight());
        $('#'+this.reload.id).outerWidth($('#'+this.search.id).outerHeight());
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
    }

    this.initButtonDisplayWaterFall = function(){
        this.displayWaterFall = document.createElement('img');
        this.displayWaterFall.id = 'HarViewerDisplayWaterFall';
        this.displayWaterFall.src = 'displayWaterFall.png';
        $('#'+this.buttons.id).append(this.displayWaterFall);
        $('#'+this.displayWaterFall.id).outerHeight($('#'+this.search.id).outerHeight());
        $('#'+this.displayWaterFall.id).outerWidth($('#'+this.search.id).outerHeight());
        $('#'+this.displayWaterFall.id).click(function(event){
            viewer.hideDetails();
            viewer.showWaterFall();
        })
    }

    this.initButtonDisplayDetails = function(){
        this.displayDetails = document.createElement('img');
        this.displayDetails.id = 'HarViewerDisplayDetails';
        this.displayDetails.src = 'displayDetails.png';
        $('#'+this.buttons.id).append(this.displayDetails);
        $('#'+this.displayDetails.id).outerHeight($('#'+this.search.id).outerHeight());
        $('#'+this.displayDetails.id).outerWidth($('#'+this.search.id).outerHeight());
        $('#'+this.displayDetails.id).click(function(event){
            viewer.hideWaterFall();
            viewer.showDetails();
        })
    }

    this.initButtons = function(){

        this.buttons = document.createElement('div');
        this.buttons.id = 'HarViewerActions';
        $('#'+this.form.id).append(this.buttons);

        this.initButtonReload();
        this.initButtonDisplayWaterFall();
        this.initButtonDisplayDetails();

        var position = $('#'+this.form.id).position();
        var width = $('#'+this.reload.id).outerWidth(true) + $('#'+this.displayWaterFall.id).outerWidth(true) + $('#'+this.displayDetails.id).outerWidth(true);
        $('#'+this.buttons.id).width(width);
        var x = position.left+$('#'+this.form.id).width()-$('#'+this.buttons.id).outerWidth(true);
        var y = position.top + $('#'+this.form.id).css('padding-top')+$('#'+this.form.id).css('margin-top');

        $('#'+this.buttons.id).css('position','absolute');
        $('#'+this.buttons.id).css('top',y);
        $('#'+this.buttons.id).css('left',x);

    }

    this.initSearchBar = function(){

        this.search = document.createElement('input');
        this.search.type = 'text';
        this.search.value = 'Search...';
        this.search.id = 'HarViewerSearch';
        $('#'+this.form.id).append(this.search);
        $('#'+this.search.id).keypress( this.onSearch );
        $('#'+this.search.id).click( this.onClickOnSearch );
        $('#'+this.search.id).focusout( this.onFocusOutSearch );

        $('#'+this.search.id).css('border-radius',($('#'+this.search.id).outerHeight()/2));
        $('#'+this.search.id).css('border-color','#000000');
        $('#'+this.search.id).css('border-width',0);
        $('#'+this.search.id).css('border-style','solid');

    }

    this.initForm = function(){

        this.form = document.createElement('form');
        this.form.id = 'HarViewerForm';

        if ($('#'+this.form.id).length){
            $('#'+this.form.id).remove();
        }

        $('#'+this.id).append(this.form);

        this.initSearchBar();
        this.initButtons();

        $('#'+this.form.id).outerWidth($('#'+this.id).outerWidth());
        $('#'+this.form.id).height($('#'+this.search.id).outerHeight());

    }

    this.initLeft = function(){
        this.left = document.createElement( 'div' );
        this.left.id = 'HarViewerLeftPanel';
        $('#'+this.content.id).append(this.left);
        $('#'+this.left.id).css('float','left');
        this.initTable();
    }

    this.initRight = function(){
        this.right = document.createElement( 'div' );
        this.right.id = 'HarViewerRightPanel';
        $('#'+this.content.id).append(this.right);
        $('#'+this.right.id).css('float','right');
        this.initTime();
        this.initWaterFallView();
        this.showWaterFall();
        this.currentEntryFocused = 0;
        this.initDetails();
        this.hideDetails();
        $('#'+this.right.id).outerWidth($('#'+this.left.id).outerWidth(true));
    }

    this.initLeftRight = function(){
        this.content = document.createElement('div');
        this.content.id = 'HarViewerContent';
        if ($('#'+this.content.id).length){
            $('#'+this.content.id).remove();
        }
        $('#'+this.id).append(this.content);

        this.initLeft();

        $('#'+this.content.id).height($('#'+this.left.id).outerHeight(true));
        $('#'+this.content.id).outerWidth($('#'+this.form.id).outerWidth(true));

        this.initRight();
    }

    this.initTable = function(){

        this.table = document.createElement( 'div' );
        this.table.id = 'HarViewerTable';

        if ($('#'+this.table.id).length){
            $('#'+this.table.id).remove();
        }

        $('#'+this.left.id).append(this.table);

        this.initFilterBar();

    }

    this.initFilterBar = function(){

        this.filters = document.createElement( 'div' );
        this.filters.id = 'HarViewerFilters';
        $('#'+this.table.id).append(this.filters);

        for (var i = 0; i < this.listFilters.length; i++) {

            var filter = document.createElement( 'div' );
            filter.id = 'HarViewerFilters_'+i;
            filter.innerHTML = this.listFilters[i];
            $('#'+this.filters.id).append(filter);
            $('#'+filter.id).addClass(filter.id);
            $('#'+filter.id).addClass(this.filters.id+''+this.listFilters[i]);
            $('#'+filter.id).click(this.onFilter);

        }

        this.initEntriesRows();

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

            $('#'+this.table.id).append(row);
            $('#'+row.id).addClass('HarViewerTableRow');
            if (i%2 == 0) {
                $('#'+row.id).css('background-color',this.colorPairRow);
            } else {
                $('#'+row.id).css('background-color',this.colorUnpairRow);
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


                $('#'+row.id).append(field);

                if (this.listFilters[j] != 'URL') {
                    $('#'+field.id).click( this.onEntry );
                }

                $('#'+field.id).addClass('HarViewerFilters'+this.listFilters[j]);
            }
        }
    }

    this.initWaterFallView = function(){

        this.waterfall = document.createElement( 'div' );
        this.waterfall.id = 'HarViewerWaterFall';

        if ($('#'+this.waterfall.id).length){
            $('#'+this.waterfall.id).remove();
        }



        $('#'+this.right.id).append(this.waterfall);

        this.initWaterFallHeader();
        this.showWaterFall();

    }

    this.initWaterFallHeader = function(){

        this.timesTh = document.createElement('div');
        this.timesTh.id = 'HarViewerTimeTh';

        $('#'+this.waterfall.id).append(this.timesTh);
        $('#HarViewerTimeTh').height($('#'+this.filters.id).height());

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

            $('#'+this.waterfall.id).append(row);
            var width = $('#'+this.waterfall.id).width();
            var trWidth = 0
            $('#HarViewerWaterFallRow_'+i).addClass('HarViewerWaterFallRow');
            beginAt = $('#'+this.waterfall.id).width() * (entry.date - this.firstDate) / this.time;
            $('#HarViewerWaterFallRow_'+i).css('padding-left',beginAt);
            $('#HarViewerWaterFallRow_'+i).outerHeight($('#HarViewerRow_0').outerHeight());
            if (i%2 == 0) {
                $('#HarViewerWaterFallRow_'+i).css('background-color',this.colorPairRow);
            } else {
                $('#HarViewerWaterFallRow_'+i).css('background-color',this.colorUnpairRow);
            }

            allTimingsBlock = document.createElement('div');
            allTimingsBlock.id = 'HarViewerWaterFallRowAllTiming_'+i;
            allTimingsBlock.title = '';

            for ( timing in entry.Timings ) {
                value = entry.Timings[timing];

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
        this.initIndicators();
    }

    this.initIndicators = function(){

        var onload = this.har.log.pages[0].pageTimings.onLoad;

        this.indicators.push({name:'onload',value:onload,color:this.colorIndicatorOnload});

        for (var i = 0; i < this.indicators.length; i++) {

            var name = this.indicators[i].name;
            var value = this.indicators[i].value;
            var color = this.indicators[i].color;
            var beginAt = $('#'+this.waterfall.id).width() * (value / this.time);

            var position = $('#'+this.right.id).position();

            var x = beginAt + position.left;
            var y = position.top + $('#HarViewerTimeTh').outerHeight(true);

            var indicator = document.createElement('div');
            indicator.id = 'HarViewerSeparator'+name;
            indicator.title = 'Name : '+name+', Value : '+value;
            $('#'+this.waterfall.id).append(indicator);
            $('#'+indicator.id).width(0);
            $('#'+indicator.id).height(($('#'+this.waterfall.id).height() - $('#HarViewerTimeTh').outerHeight(true)));
            $('#'+indicator.id).css('position','absolute');
            $('#'+indicator.id).css('z-index',6);
            $('#'+indicator.id).css('float','left');
            $('#'+indicator.id).css('top',y);
            $('#'+indicator.id).css('left',x);
            $('#'+indicator.id).css('border-right','solid');
            $('#'+indicator.id).css('border-width','2px');
            $('#'+indicator.id).css('border-color',color);
        }
    }

    this.initRequest = function(){
        this.request = document.createElement( 'div' );
        this.request.id = 'HarViewerDetailsRequest';
        this.request.innerHTML = '<p>Request</p>';
        $('#'+this.details.id).append(this.request);
        this.requestList = document.createElement( 'ul' );
        this.requestList.id = 'HarViewerDetailsRequestList';
        $('#HarViewerDetailsRequest').append(this.requestList);

        var entry = this.entriesSummaries[this.currentEntryFocused];
        var entryComplete = this.entries[this.currentEntryFocused];

        var entryRequestList = {};

        for (i = 0; i < entryComplete.request.headers.length; i++) {

            for (j = 0; j < this.requestHeader.length; j++) {
                if (entryComplete.request.headers[i].name == this.requestHeader[j]){
                    entryRequestList[this.requestHeader[j]] = entryComplete.request.headers[i].value;
                }
            }
        }

        for (i = 0; i < this.requestHeader.length ; i++){

            var li = document.createElement('li');
            li.innerHTML = '<li><p><strong>'+this.requestHeader[i]+'</strong> : '+entryRequestList[this.requestHeader[i]]+'</p>';
            $('#HarViewerDetailsRequestList').append(li);
        }
    }

    this.initResponse = function(){
        this.response = document.createElement( 'div' );
        this.response.id = 'HarViewerDetailsResponse';
        this.response.innerHTML = '<p>Response</p>';
        $('#'+this.details.id).append(this.response);
        this.responseList = document.createElement( 'ul' );
        this.responseList.id = 'HarViewerDetailsResponseList';
        $('#HarViewerDetailsResponse').append(this.responseList);

        var entry = this.entriesSummaries[this.currentEntryFocused];
        var entryComplete = this.entries[this.currentEntryFocused];

        var entryResponseList = {};

        for (i = 0; i < entryComplete.response.headers.length; i++) {

            for (j = 0; j < this.responseHeader.length; j++) {
                if (entryComplete.response.headers[i].name == this.responseHeader[j]){
                    entryResponseList[this.responseHeader[j]] = entryComplete.response.headers[i].value;
                }
            }
        }

        for (i = 0; i < this.responseHeader.length ; i++){

            var li = document.createElement('li');
            li.innerHTML = '<li><p><strong>'+this.responseHeader[i]+'</strong> : '+entryResponseList[this.responseHeader[i]]+'</p>';
            $('#HarViewerDetailsResponseList').append(li);


        }
    }

    this.initTimings = function(){
        this.timings = document.createElement( 'div' );
        this.timings.id = 'HarViewerDetailsTimings';
        this.timings.innerHTML = '<p>Timings</p>';
        $('#'+this.details.id).append(this.timings);
        this.timingsList = document.createElement( 'ul' );
        this.timingsList.id = 'HarViewerDetailsTimingsList';
        $('#HarViewerDetailsTimings').append(this.timingsList);

        var entry = this.entriesSummaries[this.currentEntryFocused];

        var entryTimingsList = entry.Timings

        for (i = 0; i < this.entryTimings.length ; i++){

            var li = document.createElement('li');
            li.innerHTML = '<li><p><strong>'+this.entryTimings[i]+'</strong> : '+entryTimingsList[this.entryTimings[i]]+'</p>';
            $('#HarViewerDetailsTimingsList').append(li);


        }
    }

    this.initDetails = function(){

        this.details = document.createElement( 'div' );
        this.details.id = 'HarViewerDetails';

        if ($('#'+this.details.id).length){
            $('#'+this.details.id).remove();
        }

        $('#'+this.right.id).append(this.details);

        this.initRequest();
        this.initResponse();
        this.initTimings();

        $('#'+this.details.id).outerHeight( $('#'+this.table.id).outerHeight(true) );

    }

    this.showDetails = function(){
        var index = this.currentEntryFocused;
        $('#HarViewerWaterFallRow_'+index).css('background-color', this.colorHighlightRow);
        $('#HarViewerRow_'+index).css('background-color', this.colorHighlightRow);
        $('#'+this.details.id).css( 'display', 'block' );
    }

    this.showWaterFall = function(){
        $('#'+this.waterfall.id).css( 'display', 'block' );
    }

    this.hideDetails = function(){
        var index = this.currentEntryFocused;
        if (index%2 == 0) {
            $('#HarViewerWaterFallRow_'+index).css('background-color',this.colorPairRow);
            $('#HarViewerRow_'+index).css('background-color',this.colorPairRow);
        } else {
            $('#HarViewerWaterFallRow_'+index).css('background-color',this.colorUnpairRow);
            $('#HarViewerRow_'+index).css('background-color',this.colorUnpairRow);
        }
        if (viewer.currentEntryFocused%2 == 0) {
            $('#HarViewerWaterFallRow_'+viewer.currentEntryFocused).css('background-color',this.colorPairRow);
            $('#HarViewerRow_'+viewer.currentEntryFocused).css('background-color',this.colorPairRow);
        } else {
            $('#HarViewerWaterFallRow_'+viewer.currentEntryFocused).css('background-color',this.colorUnpairRow);
            $('#HarViewerRow_'+viewer.currentEntryFocused).css('background-color',this.colorUnpairRow);
        }
        $('#'+this.details.id).css( 'display', 'none' );
    }

    this.hideWaterFall = function(){
        $('#'+this.waterfall.id).css( 'display', 'none' );
    }

    this.onClickOnSearch = function(event){
        $('#'+viewer.search.id).prop( 'value' , '');
    }

    this.onFocusOutSearch = function(event){
        $('#'+viewer.search.id).prop( 'value' , 'Search...');
    }

    this.onSearch = function(event){
        var str = $('#'+viewer.search.id).prop( 'value' );
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
        if (index == viewer.currentEntryFocused && !viewer.firstDetails) {
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
        } else if(viewer.firstDetails) {
            viewer.firstDetails = false;
            viewer.initDetails();
            viewer.hideWaterFall();
            viewer.showDetails();
        }else {
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

    $( window ).resize(function() {
        viewer.initFrontEnd();
    });

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
