let specs = {
  "bar": {
    "type": "serial",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "graphs": "{{graphs}}",
    "graphTemplate": [{
      "fillAlphas": 0.2,
      "lineAlpha": 0.8,
      "type": "column",
      "color": "#000000"
    }],
    "theme": "dark",
    "legend": {
      "horizontalGap": 10,
      "maxColumns": 1,
      "position": "right",
      "useGraphSettings": true,
      "markerSize": 10
    },
    "valueAxes": [ {
      "gridColor": "#FFFFFF",
      "gridAlpha": 0.2,
      "dashLength": 0,
      "stackType": "regular"
    } ],
    "gridAboveGraphs": true,
    "startDuration": 0.3,
    "startEffect": "easeInSine",
    "chartCursor": {
      "categoryBalloonEnabled": false,
      "cursorAlpha": 0,
      "zoomable": false
    },
    "categoryAxis": {
      "axisColor": "#DADADA",
      "gridAlpha": 0.07,
      "gridPosition": "start",
      "gridAlpha": 0,
      "tickPosition": "start",
      "tickLength": 20,
      "guides": []
    },
    "export": {
      "enabled": true
    }
  },
  "line": {
    "type": "serial",
    "theme": "light",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "graphs": "{{graphs}}",
    "graphTemplate": [{
      "fillAlphas": 0,
      "lineAlpha": 1,
      "dashLengthField": "dashLengthLine",
      "useLineColorForBulletBorder": true,
      "bulletBorderThickness": 3,
      "bullet": "circle",
      "bulletBorderAlpha": 0.8,
      "bulletAlpha": 0.8,
      "bulletColor": "#FFFFFF",
    }],
    "legend": {
      "horizontalGap": 10,
      "position": "bottom",
      "useGraphSettings": true,
      "markerSize": 10
    },
    "valueAxes": [ {
      "gridColor": "#FFFFFF",
      "gridAlpha": 0.2,
      "dashLength": 0,
    } ],
    "gridAboveGraphs": true,
    "startDuration": 0.1,
    "startEffect": "easeInSine",
    "chartCursor": {
      "categoryBalloonEnabled": false,
      "cursorAlpha": 0,
      "zoomable": false
    },
    "categoryAxis": {
      "gridPosition": "start",
      "gridAlpha": 0,
      "tickPosition": "start",
      "tickLength": 20,
      "guides": []
    },
    "export": {
      "enabled": true
    }
  },
  "area": {
    "type": "serial",
    "theme": "light",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "graphs": "{{graphs}}",
    "graphTemplate": [{
      "fillAlphas": 0.6,
      "lineAlpha": 1,
      "dashLengthField": "dashLengthLine",
      "useLineColorForBulletBorder": true,
      "bulletBorderThickness": 3,
      "bullet": "circle",
      "bulletBorderAlpha": 0.8,
      "bulletAlpha": 0.8,
      "bulletColor": "#FFFFFF",
    }],
    "legend": {
      "horizontalGap": 10,
      "position": "bottom",
      "useGraphSettings": true,
      "markerSize": 10
    },
    "valueAxes": [ {
      "gridColor": "#FFFFFF",
      "gridAlpha": 0.2,
      "dashLength": 0,
      "stackType": "regular"
    } ],
    "gridAboveGraphs": true,
    "startDuration": 0.1,
    "startEffect": "easeInSine",
    "chartCursor": {
      "categoryBalloonEnabled": false,
      "cursorAlpha": 0,
      "zoomable": false
    },
    "categoryAxis": {
      "gridPosition": "start",
      "gridAlpha": 0,
      "tickPosition": "start",
      "tickLength": 20,
      "guides": []
    },
    "export": {
      "enabled": true
    }
  },
  "radar": {
    "theme": "light",
    "type": "radar",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "valueAxes": [{
      "gridType": "circles",
      "minimum": 0
    }],
    "polarScatter": {
      "minimum": 0,
      "maximum": 400,
      "step": 1
    },
    "startDuration": 0,
    "graphs": "{{graphs}}",
    "graphTemplate": [{}],
    "groupPercent": 5,
    "balloon":{
       "fixedPosition":true
      },
    "legend":{
      "position":"right",
      "marginRight":100,
      "autoMargins":false
    },
  },
  "pie": {
    "type": "pie",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "innerRadius": "30%",
    "startDuration": 0,
    "graphs": "{{graphs}}",
    "graphTemplate": [{}],
    "groupPercent": 5,
    "balloon":{
       "fixedPosition":true
      },
    "legend":{
      "position":"right",
      "marginRight":100,
      "autoMargins":false
    },
  },
  "scatter": {
    "type": "xy",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "autoMarginOffset": 20,
    "startDuration": 0,
    "valueAxes": [ {
        "position": "bottom",
        "axisAlpha": 0
      }, {
        "axisAlpha": 0,
        "position": "left"
      } ],
      "chartScrollbar": {
        "scrollbarHeight":2,
        "offset":-1,
        "backgroundAlpha":0.1,
        "backgroundColor":"#888888",
        "selectedBackgroundColor":"#67b7dc",
        "selectedBackgroundAlpha":1
      },
      "chartCursor": {
        "fullWidth":true,
        "valueLineEabled":true,
        "valueLineBalloonEnabled":true,
        "valueLineAlpha":0.5,
        "cursorAlpha":0
      },
    "graphs": "{{graphs}}",
    "graphTemplate": [{
      "fillAlphas": 0,
      "lineAlpha": 0,
      "bullet": "circle",
      "bulletBorderAlpha": 0.2,
      "bulletAlpha": 0.8,
      "color": "#000000",
      "valueField": null,
      "xField": null,
      "yField": null,
    }]
  },
  "timeline": {
    "type": "serial",
    "theme": "light",
    "dataProvider": "{{data}}",
    "titleField": "{{title}}",
    "categoryField": "{{category}}",
    "valueField": "{{valueField}}",
    "marginRight": 40,
    "marginLeft": 40,
    "autoMarginOffset": 20,
    "mouseWheelZoomEnabled":true,
    "dataDateFormat": "YYYY-MM-DD",
    "valueAxes": [{
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth":true
    }],
    "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
    },
    "graphs": "{{graphs}}",
    "graphTemplate": [{
        "id": "g1",
        "balloon":{
          "drop":true,
          "adjustBorderColor":false,
          "color":"#ffffff"
        },
        "bullet": "round",
        "bulletBorderAlpha": 1,
        "bulletColor": "#FFFFFF",
        "bulletSize": 5,
        "hideBulletsCount": 50,
        "lineThickness": 2,
        "title": "red line",
        "useLineColorForBulletBorder": true,
        "valueField": null
    }],
    "chartScrollbar": {
        "graph": "g1",
        "oppositeAxis":false,
        "offset":30,
        "scrollbarHeight": 80,
        "backgroundAlpha": 0,
        "selectedBackgroundAlpha": 0.1,
        "selectedBackgroundColor": "#888888",
        "graphFillAlpha": 0,
        "graphLineAlpha": 0.5,
        "selectedGraphFillAlpha": 0,
        "selectedGraphLineAlpha": 1,
        "autoGridCount":true,
        "color":"#AAAAAA"
    },
    "chartCursor": {
        "pan": true,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "cursorAlpha":1,
        "cursorColor":"#258cbb",
        "limitToGraph":"g1",
        "valueLineAlpha":0.2,
        "valueZoomable":true
    },
    "valueScrollbar":{
      "oppositeAxis":false,
      "offset":50,
      "scrollbarHeight":10
    },
    "categoryField": "date",
    "categoryAxis": {
        "parseDates": true,
        "dashLength": 1,
        "minorGridEnabled": true
    },
    "export": {
        "enabled": true
    }
  }
}

export default specs
