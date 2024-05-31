const scriptBaseConfig = { inverterIpAddress: '192.168.0.109', gwidth: 200, gheight: 120, pfs1limit: 300, pfs2limit: 1000, pfs3limit: 4000, pfs4limit: 8000, pfs1colour: '#99ff33', pfs2colour: '#66cc00', pfs3colour: '#4d9900', pfs4colour: '#336600', pfg1limit: 300, pfg2limit: 1000, pfg3limit: 4000, pfg4limit: 8000, pfg1colour: '#ff9999', pfg2colour: '#ff0000', pfg3colour: '#b81414', pfg4colour: '#660000' };
var scriptConfig = {};
let fm = FileManager.local();
var scriptConfigFilename = fm.documentsDirectory() + "/froniusMonitorConfig";

if (!fm.fileExists(scriptConfigFilename))
    scriptConfig = scriptBaseConfig;
else
{
    try
    {
        var scriptConfigFromFile = JSON.parse(fm.readString(scriptConfigFilename));
        Object.keys(scriptBaseConfig).forEach(key => {
            scriptConfig[key] = scriptConfigFromFile.hasOwnProperty(key) ? scriptConfigFromFile[key] : scriptBaseConfig[key];
        });
    } catch (err)
    {
        scriptConfig = scriptBaseConfig;
    }
}

fm.writeString(scriptConfigFilename, JSON.stringify(scriptConfig));

let html = `
<!DOCTYPE html>
<html>
<head>
<style>
html, body {
    font-family: 'Arial', sans-serif;
    overscroll-behavior-y: none;
}
.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-size: 17px;
}
.tab button:hover {
  background-color: #ddd;
}
.tab button.active {
  background-color: #ccc;
}
.tabcontent {
  display: none;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none;
}
.canvas-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.gauge-title {
    display: inline-block; width: 200px; white-space: nowrap; font-weight: bold; color: dimgray; text-align: center; font-size: 22px;
}
.gauge-power {
    background-color: black; color: white; border-radius: 10px; padding: 5px;
}
.config-container {	display: flex; justify-content: flex-start; }
.config-left { }
.config-right { margin-left: auto; }
.size-field { width: 80px; }
.alert {
    padding: 20px;
    background-color: #f44336;
    color: white;
}
.alert.success {background-color: #04AA6D;}
.alert.info {background-color: #2196F3;}
.alert.warning {background-color: #ff9800;}
.form * {
    font-size: 20px;
}
</style>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.1.0/chart.js"></script>

<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'Realtime Charts')" id="defaultOpen">Realtime Charts</button>
  <button class="tablinks" onclick="openTab(event, 'Configuration')">Configuration</button>
  <button class="tablinks" onclick="openTab(event, 'Events')">Events</button>
</div>

<div id="Realtime Charts" class="tabcontent">
    <div style="height: 300px; width: 100%;"><canvas id="overTimeChart"></canvas></div>
    
	<div class="canvas-container">
        <div><span class="gauge-title">Power From Solar <span id="powerFromSolar" class="gauge-power"></span></span></div>
        <div><span class="gauge-title">Power From Grid <span id="powerFromGrid" class="gauge-power"></span></span></div>
	</div>
	<div class="canvas-container">
        <div><canvas id="fromSolarGauge" width="${scriptConfig.gwidth}" height="${scriptConfig.gheight}"></canvas></div>
        <div><canvas id="fromGridGauge" width="${scriptConfig.gwidth}" height="${scriptConfig.gheight}"></canvas></div>
	</div>

    <div class="alert warning" id="requestFailedAlert" style="display: none;">
        <strong>Warning!</strong> Cannot locate the inverter, check the IP Address in the Configuration tab.
    </div>
</div>

<div id="Configuration" class="tabcontent">
    <div class="form">
        <div class="config-container">
            <div class="config-left"><label for="inverterAddress">Inverter IP Address:</label> <input type="text" id="inverterAddress" value=""> <span class="material-icons" id="inverterStatus"></span></div>
            <div class="config-right"><button onclick="restoreDefaults()">Restore Default</button></div>
            <div class="config-right"><button onclick="saveConfig()">Save</button></div>
        </div>
        <br>
        <fieldset>
            <legend>Gauges:</legend>
            <label for="gwidth">Width:</label> <input type="text" id="gwidth" value="${scriptConfig.gwidth}"> <label for="gheight">Height:</label> <input type="text" id="gheight" value="${scriptConfig.gheight}">
            <br><br>
            <fieldset>
                <legend>Power From Solar:</legend>
                <label for="pfs1limit">Band 1 Limit (W):</label> <input type="number" id="pfs1limit" class="size-field" value="${scriptConfig.pfs1limit}"> <label for="pfs1colour">Colour:</label> <input type="text" id="pfs1colour" value="${scriptConfig.pfs1colour}"><br><br>
                <label for="pfs2limit">Band 2 Limit (W):</label> <input type="number" id="pfs2limit" class="size-field" value="${scriptConfig.pfs2limit}"> <label for="pfs2colour">Colour:</label> <input type="text" id="pfs2colour" value="${scriptConfig.pfs2colour}"><br><br>
                <label for="pfs3limit">Band 3 Limit (W):</label> <input type="number" id="pfs3limit" class="size-field" value="${scriptConfig.pfs3limit}"> <label for="pfs3colour">Colour:</label> <input type="text" id="pfs3colour" value="${scriptConfig.pfs3colour}"><br><br>
                <label for="pfs4limit">Band 4 Limit (W):</label> <input type="number" id="pfs4limit" class="size-field" value="${scriptConfig.pfs4limit}"> <label for="pfs4colour">Colour:</label> <input type="text" id="pfs4colour" value="${scriptConfig.pfs4colour}"><br><br>
            </fieldset>        
            <br>
            <fieldset>
                <legend>Power From Grid:</legend>
                <label for="pfg1limit">Band 1 Limit (W):</label> <input type="number" id="pfg1limit" class="size-field" value="${scriptConfig.pfg1limit}"> <label for="pfg1colour">Colour:</label> <input type="text" id="pfg1colour" value="${scriptConfig.pfg1colour}"><br><br>
                <label for="pfg2limit">Band 2 Limit (W):</label> <input type="number" id="pfg2limit" class="size-field" value="${scriptConfig.pfg2limit}"> <label for="pfg2colour">Colour:</label> <input type="text" id="pfg2colour" value="${scriptConfig.pfg2colour}"><br><br>
                <label for="pfg3limit">Band 3 Limit (W):</label> <input type="number" id="pfg3limit" class="size-field" value="${scriptConfig.pfg3limit}"> <label for="pfg3colour">Colour:</label> <input type="text" id="pfg3colour" value="${scriptConfig.pfg3colour}"><br><br>
                <label for="pfg4limit">Band 4 Limit (W):</label> <input type="number" id="pfg4limit" class="size-field" value="${scriptConfig.pfg4limit}"> <label for="pfg4colour">Colour:</label> <input type="text" id="pfg4colour" value="${scriptConfig.pfg4colour}"><br><br>
            </fieldset>        
        </fieldset>        
    </div>

    <div class="alert warning" id="ipAddressFailedAlert" style="display: none;">
        <strong>Warning!</strong> Cannot reach the inverter, IP address may be incorrect, enter the correct address above.
    </div>
</div>

<div id="Events" class="tabcontent">
</div>

<script>
// Manage script configuration

var scriptConfig = ${JSON.stringify(scriptConfig)};
document.getElementById('inverterAddress').value = scriptConfig.inverterIpAddress;

function restoreDefaults() {
    scriptConfig = JSON.parse(JSON.stringify(scriptBaseConfig));
}

function saveConfig() {
    
    scriptConfig.inverterIpAddress = document.getElementById('inverterAddress').value;
    scriptConfig.gwidth = document.getElementById('gwidth').value;
    document.getElementById('fromSolarGauge').width = scriptConfig.gwidth;
    document.getElementById('fromGridGauge').width = scriptConfig.gwidth;
    scriptConfig.gheight = document.getElementById('gheight').value;
    document.getElementById('fromSolarGauge').height = scriptConfig.gheight;
    document.getElementById('fromGridGauge').height = scriptConfig.gheight;

    var gaugeTitles = document.getElementsByClassName('gauge-title');

    for (var i = 0; i < gaugeTitles.length; i++) {
        gaugeTitles[i].style.width = scriptConfig.gwidth;
    }

    scriptConfig.pfs1limit = document.getElementById('pfs1limit').value;
    scriptConfig.pfs2limit = document.getElementById('pfs2limit').value;
    scriptConfig.pfs3limit = document.getElementById('pfs3limit').value;
    scriptConfig.pfs4limit = document.getElementById('pfs4limit').value;
    fromSolarGauge.data.datasets[0].data = [scriptConfig.pfs1limit, scriptConfig.pfs2limit, scriptConfig.pfs3limit, scriptConfig.pfs4limit];
    scriptConfig.pfs1colour = document.getElementById('pfs1colour').value;
    scriptConfig.pfs2colour = document.getElementById('pfs2colour').value;
    scriptConfig.pfs3colour = document.getElementById('pfs3colour').value;
    scriptConfig.pfs4colour = document.getElementById('pfs4colour').value;
    fromSolarGauge.data.backgroundColor = [scriptConfig.pfs1colour, scriptConfig.pfs2colour, scriptConfig.pfs3colour, scriptConfig.pfs4colour];
    scriptConfig.pfg1limit = document.getElementById('pfg1limit').value;
    scriptConfig.pfg2limit = document.getElementById('pfg2limit').value;
    scriptConfig.pfg3limit = document.getElementById('pfg3limit').value;
    scriptConfig.pfg4limit = document.getElementById('pfg4limit').value;
    fromGridGauge.data.datasets[0].data = [scriptConfig.pfg1limit, scriptConfig.pfg2limit, scriptConfig.pfg3limit, scriptConfig.pfg4limit];
    scriptConfig.pfg1colour = document.getElementById('pfg1colour').value;
    scriptConfig.pfg2colour = document.getElementById('pfg2colour').value;
    scriptConfig.pfg3colour = document.getElementById('pfg3colour').value;
    scriptConfig.pfg4colour = document.getElementById('pfg4colour').value;
    fromGridGauge.data.backgroundColor = [scriptConfig.pfg1colour, scriptConfig.pfg2colour, scriptConfig.pfg3colour, scriptConfig.pfg4colour];
    
}

// Manage the tabs

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();
</script>

<script src="https://unpkg.com/chartjs-gauge-v3/dist/index.js"></script>
</body>
</html>`;

let overTimeScript = `
// Manage the over time chart

const canvas = document.getElementById('overTimeChart');
const labels = [];
Chart.defaults.font.size = 20;

const data = {
    labels: labels,
    datasets: [{
        label: 'Consumed in full',
        fill: false,
        order: 1,
        backgroundColor: 'Orange', borderColor: 'Orange', pointRadius: 0, pointHoverRadius: 0
    },{
        label: 'Consumed from solar',
        fill: true,
        order: 2,
        backgroundColor: '#66cc00', borderColor: '#66cc00', pointRadius: 0, pointHoverRadius: 0,
        stack: 'Stack 1'
    },{
        label: 'Consumed from grid',
        fill: true,
        order: 3,
        backgroundColor: '#ff0000', borderColor: '#ff0000', pointRadius: 0, pointHoverRadius: 0,
        stack: 'Stack 1'
    },{
        label: 'Sent to grid',
        fill: true,
        order: 4,
        backgroundColor: 'Grey', borderColor: 'Grey', pointRadius: 0, pointHoverRadius: 0,
        stack: 'Stack 1'
    }]
};

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0, easing: 'linear' },
        scales: {
            x: {
                ticks: { autoSkip: false, maxRotation: 15, minRotation: 15 },
                grid: { drawTicks: true, tickLength: 10, tickWidth: 2, tickColor: 'Black' },
                afterBuildTicks: function(scale) {
                    scale.ticks = scale.ticks.filter(function(value, index) {
                        return (index % 15 === 0);
                    });
                }                
            },
            y: {
                beginAtZero: true,
                position: 'right',
                title: { display: true, text: 'Watts' },
                gridLines: { drawOnChartArea: true },
                grid: { z: 1 },
                ticks: { stepSize: 100 }
            }
        },
        plugins: {
            title: { display: true, text: 'Power Over Time' }
        }
    }
};

const overTimeChart = new Chart(canvas, config);

function addData(chart, label, p_load_data, p_from_solar, p_grid_from_grid_data, p_grid_to_grid_data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(p_load_data);
    chart.data.datasets[1].data.push(p_from_solar);
    chart.data.datasets[2].data.push(p_grid_from_grid_data);
    chart.data.datasets[3].data.push(p_grid_to_grid_data);

    if (chart.data.labels.length > 120)
    {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[2].data.shift();
        chart.data.datasets[3].data.shift();
    }

    chart.update();
}`;

let gaugesScript = `
// Manage the gauges

var fromGridCanvas;
var fromGridGauge;
var fromSolarCanvas;
var fromSolarGauge;

function addGaugeData(chart, newdata) {
    chart.data.datasets[0].value = newdata;
    chart.update();
}    

setTimeout(function() {

    var fromGridConfig = {
        type: 'gauge',
        data: {
            datasets: [{ data: [${scriptConfig.pfg1limit}, ${scriptConfig.pfg2limit}, ${scriptConfig.pfg3limit}, ${scriptConfig.pfg4limit}], value: 1, backgroundColor: ["${scriptConfig.pfg1colour}", "${scriptConfig.pfg2colour}", "${scriptConfig.pfg3colour}", "${scriptConfig.pfg4colour}"], borderWidth: 2 }]
        },
        options: {
            responsive: false,
            layout: { padding: { top: 0, bottom: 0 } },
            valueLabel: { display: false }
        }
    };

    var fromSolarConfig = {
        type: 'gauge',
        data: {
            datasets: [{ data: [${scriptConfig.pfs1limit}, ${scriptConfig.pfs2limit}, ${scriptConfig.pfs3limit}, ${scriptConfig.pfs4limit}], value: 1, backgroundColor: ["${scriptConfig.pfs1colour}", "${scriptConfig.pfs2colour}", "${scriptConfig.pfs3colour}", "${scriptConfig.pfs4colour}"], borderWidth: 2 }]
        },
        options: {
            responsive: false,
            layout: { padding: { top: 0, bottom: 0 } },
            valueLabel: { display: false }
        }
    };
  
    fromSolarCanvas = document.getElementById('fromSolarGauge').getContext('2d');
    fromSolarGauge = new Chart(fromSolarCanvas, fromSolarConfig);

    fromGridCanvas = document.getElementById('fromGridGauge').getContext('2d');
    fromGridGauge = new Chart(fromGridCanvas, fromGridConfig);
  
}, 1000);
`;


let wv = new WebView();
await wv.loadHTML(html);
await wv.evaluateJavaScript(overTimeScript, false);
await wv.evaluateJavaScript(gaugesScript, false);
wv.present();

var scriptConfigCopy = scriptConfig;
const timer = new Timer();
timer.repeats = true;
timer.timeInterval = 1000;
timer.schedule(async () => {

    var inverterAddress = await wv.evaluateJavaScript(`document.getElementById('inverterAddress').value;`, false);
    var request = new Request('http://' + inverterAddress + '/solar_api/v1/GetPowerFlowRealtimeData.fcgi');
    var result;

    try {
        result = await request.loadJSON();
        await wv.evaluateJavaScript("document.getElementById('requestFailedAlert').style.display = 'none';", false);
        await wv.evaluateJavaScript("document.getElementById('ipAddressFailedAlert').style.display = 'none';", false);
        await wv.evaluateJavaScript("document.getElementById('inverterStatus').innerHTML = '&#xe2e6;';", false);

        var d = new Date();
        var newLabel = d.toLocaleTimeString();
    
        var p_load = Math.abs(result.Body.Data.Site.P_Load);            // Consumed in full
        var p_grid_from_grid = 0;                                       // Comsumed from grid
        var p_grid_to_grid = 0;                                         // Sent to grid
    
        if (result.Body.Data.Site.P_Grid < 0)
            p_grid_to_grid = Math.abs(result.Body.Data.Site.P_Grid);
        else
            p_grid_from_grid = Math.abs(result.Body.Data.Site.P_Grid);

        var p_from_solar = p_load - p_grid_from_grid;                   // Consumed from solar (not from the grid)

        await wv.evaluateJavaScript('addData(overTimeChart, "' + newLabel + '", ' + p_load + ', ' + p_from_solar + ', ' + p_grid_from_grid + ', ' + p_grid_to_grid + ');', false);
        await wv.evaluateJavaScript('addGaugeData(fromGridGauge, ' + p_grid_from_grid + ');', false);
        await wv.evaluateJavaScript("document.getElementById('powerFromGrid').textContent = '" + Math.floor(p_grid_from_grid) + "W';", false);
        await wv.evaluateJavaScript('addGaugeData(fromSolarGauge, ' + (p_from_solar+p_grid_to_grid) + ');', false);
        await wv.evaluateJavaScript("document.getElementById('powerFromSolar').textContent = '" + Math.floor(p_from_solar+p_grid_to_grid) + "W';", false);
    } catch (err)
    {
        await wv.evaluateJavaScript("document.getElementById('requestFailedAlert').style.display = 'block';", false);
        await wv.evaluateJavaScript("document.getElementById('ipAddressFailedAlert').style.display = 'block';", false);
        await wv.evaluateJavaScript("document.getElementById('inverterStatus').innerHTML = '&#xe000;';", false);
    }

    scriptConfig = await wv.evaluateJavaScript("scriptConfig;", false);

    if (JSON.stringify(scriptConfig) != JSON.stringify(scriptConfigCopy))
        fm.writeString(scriptConfigFilename, JSON.stringify(scriptConfig));

    scriptConfigCopy = JSON.parse(JSON.stringify(scriptConfig));
});
