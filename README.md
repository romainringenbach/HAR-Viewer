# HAR-Viewer

![image](https://raw.githubusercontent.com/nealith/HAR-Viewer/dev/har-viewer.png)

HAR-Viewer is a web embeded viewer for your HTTP Archive, but for only one page.

! This viewer use lot of ids, so you should only display one viewer.

## Get started

A example is already in the package, index.html

## Features

- Waterfall visual
- Details visual by click on row
- Sort by filter
- Search    
- Tooltips
- Visual indicators on waterfall (onLoad is already defined)

## Documentation

    new HarViewer(id,[indicator, indicator2...])

- id is the id of the div where HAR-Viewer will be Build
- indicator is object :

    {
        name : 'name',
        value : value,
        color : '#000000'

    }  
    
    HarViewer.loadHar(data)
    
- data is the har in json format  
