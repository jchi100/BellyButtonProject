
//var firstsample='';

function getOptions() {
    
    var selDataset = document.getElementById('selDataset');
    
    Plotly.d3.json('/names', function(error, sampleNames) {
        for (var i = 0; i < sampleNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i];
            currentOption.id = i;
            selDataset.appendChild(currentOption);
        }
    })

}

function getMetadata(inputdata){
   
   var url = `/metadata/${inputdata}`
 
   var $tbody = document.querySelector("tbody");
    $tbody.innerHTML = "";
 
    Plotly.d3.json(url,function(error,response){
        if (error) return console.log(error);
        console.log(response);
        var i =0;
        for(var key in response) {
            var $row = $tbody.insertRow(i);
            var $cell = $row.insertCell(0);
         
            $cell.innerText = key;
            var $cell = $row.insertCell(1);
            $cell.innerText = response[key];
        
            i = i+1;
        }
        
    });

};

function renderPie(inputdata) {
    
    var url = `/samples/${inputdata}`
    Plotly.d3.json(url,function(error,data){
        if (error) return console.log(error);
       
         var values = Object.keys(data).map(function(key){
            return data[key];
        });
        console.log("values:");
        var lable_list = values[0].slice(0, 10);
        var value_list =values[2].slice(0, 10);
        var data = [{
            labels:lable_list,
            values: value_list,
            hovertext: values[0].slice(0, 10),
            name:  values[0].slice(0, 10),
            hoverinfo: 'hovertext',
            type: 'pie'
        }]

        var pieLayout = {
            height: 400,
            width: 400,
            margin: { t: 0, l: 0 }
        };
        var PIE = document.getElementById('pie');
        Plotly.newPlot(PIE, data, pieLayout);
    
    })

}


function renderBubble(sample) {

    var url = `/samples/${sample}`;
    
    Plotly.d3.json(url,function(error,data){
        if (error) return console.log(error);
        var values = Object.keys(data).map(function(key){
            return data[key];
        });
        
        var trace = {
            x: values[0],
            y: values[2],
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: values[2],
                color: values[0],
                colorscale: "Jet"
        
            },
            text: values[1],
          };

          var layout = {
            title: '<b>Sample Value vs the OTU ID<b>',
            xaxis: { title: 'OTU ID' }
        };
    
        var bubbledata = [trace]
        var bubbleid = document.getElementById('bubble');
        Plotly.newPlot(bubbleid, bubbledata, layout)
    });

}
function renderGauge(inputdata) {
    
    var url = `/wfreq/${inputdata}`
    Plotly.d3.json(url, function(error, wfreq) {
        if (error) return console.warn(error);
        var level = wfreq*20;
        // Trig to calc meter point
        var degrees = 180 - level,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
        
        var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
        var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 12, color:'850000'},
            showlegend: false,
            name: 'Freq',
            text: level,
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:[
                'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];
        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    
        height: 500,
        width: 500,
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };
        var GAUGE = document.getElementById('gauge');
        Plotly.newPlot(GAUGE, data, layout);
    });
}

function optionChanged(inputsample) {
    getMetadata(inputsample);
    renderBubble(inputsample);
    renderPie(inputsample);
    renderGauge(inputsample);

}

function init() {

    getOptions();
    
    Plotly.d3.json('/names', function(error, sampleNames) {
        getMetadata(sampleNames[0]);
        renderPie(sampleNames[0]);
        renderBubble(sampleNames[0]);
        renderGauge(sampleNames[0]);
    })
    
}


init();

   