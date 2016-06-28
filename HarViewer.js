function HarViewer(){

    this.entriesSummaries = new Array();
    this.showedEntries = new Array();

    this.form = null;
    this.search = null;
    this.content = null;
    this.left = null;
    this.right = null;
    this.table = null;
    this.listFilters = null;
    this.filters = null;
    this.time = null;
    this.waterfall = null;
    this.timesTh = null;
    this.details = null;

    this.currentEntryFocused = null;

    this.loadHar = function(har){
        this.entriesSummaries = new Array();
        this.har = har;
        this.entries = parseHar(har);

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
        this.initDetails();
        this.hideDetails();
        this.initWaterFallView();
        this.showWaterFall();

    }

    this.initTable = function(){

        if ($('#HarViewerTable').length){
            $('#HarViewerTable').remove();
        }

        this.table = document.createElement( 'table' );
        this.table.id = 'HarViewerTable';

        $('#HarViewerLeftPanel').append(this.table);

        this.initFilterBar();

    }

    this.initFilterBar = function(){
        this.listFilters = ['Name','URL','Method','Status','Type','Size','Time'];

        this.filters = document.createElement( 'tr' );
        this.filters.id = 'HarViewerFilters';
        $('#HarViewerTable').append(this.filters);

        for (var i = 0; i < this.listFilters.length; i++) {

            var filter = document.createElement( 'th' );
            filter.id = this.listFilters[i];
            filter.innerHTML = this.listFilters[i];
            $('#HarViewerFilters').append(filter);

        }

        this.initEntriesSummaries();

    }

    this.initEntriesSummaries = function(){

        this.time = 0;

        for (var i = 0; i < this.entries.length; i++) {
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

            entry = {
                Name: name,
                URL: this.entries[i].request.url,
                Method: this.entries[i].request.method,
                Status: this.entries[i].response.status,
                Type: this.entries[i].response.content.mimeType,
                Size: this.entries[i].response.content.size,
                Time: this.entries[i].time,
                Timings: this.entries[i].timings
            };
            this.time = this.time + entry.time;
            this.showedEntries.push(entry);
            this.entriesSummaries.push(entry);
        }

        this.initEntriesRows();
    }

    this.initEntriesRows = function(){

        for (var i = 0; i < this.showedEntries.length; i++) {

            var entry = this.showedEntries[i];

            var row = document.createElement('tr');
            row.id = 'HarViewerRow_'+i;

            $('#HarViewerTable').append(row);

            for (var j = 0; j < this.listFilters.length; j++) {
                this.listFilters[j]
                var field = document.createElement('td');
                field.id = 'HarViewerRow_'+this.listFilters[j]+'_'+i;
                if (this.listFilters[j] == 'URL') {
                    field.innerHTML = '<a href="entry[this.listFilters[j]]">'+entry[this.listFilters[j]]+'</a>';
                } else {
                    field.click(this.onEntry);
                    field.innerHTML = entry[this.listFilters[j]];
                }


                $('#HarViewerRow_'+i).append(field);
            }
        }
    }

    this.initWaterFallView = function(){

        if ($('#HarViewerWaterFall').length){
            $('#HarViewerWaterFall').remove();
        }

        this.waterfall = document.createElement( 'table' );
        this.waterfall.id = 'HarViewerWaterFall';

        $('#HarViewerLeftPanel').append(this.waterfall);

        this.initWaterFallHeader();
        this.showWaterFall();

    }

    this.initWaterFallHeader = function(){

        this.timesTh = document.createElement('tr');
        this.timesTh.id = 'HarViewerTimeTh';

        $('#HarViewerWaterFall').append(this.timesTh);

        var divTime = this.time / 10;

        for (var i = 0; i < 10; i++) {

            var timeDiv = document.createElement('th');
            timeDiv.id = 'HarViewerTimeTh_'+i;
            timeDiv.innerHTML = divTime*i+'ms';
            $('#HarViewerTimeTh').append(timeDiv);

        }

        this.initWaterFallRows();
    }

    this.initWaterFallRows = function(){

    }

    this.initDetails = function(){

        if ($('#HarViewerDetails').length){
            $('#HarViewerDetails').remove();
        }

        this.details = document.createElement( 'div' );
        this.details.id = 'HarViewerDetails';

        $('#HarViewerRightPanel').append(this.details);

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

    this.onSearch = function(event){
        console.log('lol');
        var str = $('#HarViewerSearch').attr( 'value' );
        this.showedEntries = new Array();

        for (var i = 0; i < this.entriesSummaries.length; i++) {
            var entry = this.entriesSummaries[i]
            var find = false;
            for (var i = 0; (i < this.listFilters.length && !find); i++) {
                if(JSON.stringify(entry[this.listFilters[i]]).includes(str)){
                    find = true;
                    this.showedEntries.push(entry);
                }
            }

        }

        this.initTable();
        this.initWaterFallView();

    }

    this.onEntry = function(event){
        if (this.currentEntryFocused == event.currentTarget) {
            this.hideDetails();
            this.showWaterFall();
        } else {
            this.currentEntryFocused = event.currentTarget;
            this.initDetails();
            this.hideWaterFall();
            this.showDetails();
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
