const scriptBaseConfig = { inverterIpAddress: '192.168.0.109' };
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
    display: inline-block; width: 200px; white-space: nowrap; font-weight: bold; color: dimgray;
}
.gauge-power {
    background-color: black; color: white; border-radius: 10px; padding: 5px;
}
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
        <div style="text-align: center; font-size: 22px;"><span class="gauge-title">Power From Solar <span id="powerFromSolar" class="gauge-power"></span></span></div>
        <div style="text-align: center; font-size: 22px;"><span class="gauge-title">Power From Grid <span id="powerFromGrid" class="gauge-power"></span></span></div>
	</div>
	<div class="canvas-container">
        <div><canvas id="fromSolarGauge" width="200" height="120"></canvas></div>
        <div><canvas id="fromGridGauge" width="200" height="120"></canvas></div>
	</div>

    <div class="alert warning" id="requestFailedAlert" style="display: none;">
        <strong>Warning!</strong> Cannot locate the inverter, check the IP Address in the Configuration tab.
    </div>
</div>

<div id="Configuration" class="tabcontent">
    <div class="form">
        <label for="inverterAddress">Inverter IP Address:</label> <input type="text" id="inverterAddress" value=""> <span class="material-icons" id="inverterStatus"></span><br>
        <button onclick="saveConfig()">Save</button><br>
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

function saveConfig() {
    scriptConfig.inverterIpAddress = document.getElementById('inverterAddress').value;
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
            datasets: [{ data: [300, 1000, 4000, 8000], value: 1, backgroundColor: ["#ff9999", "#ff0000", "#b81414", "#660000"], borderWidth: 2 }]
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
            datasets: [{ data: [300, 1000, 4000, 8000], value: 1, backgroundColor: ["#99ff33", "#66cc00", "#4d9900", "#336600"], borderWidth: 2 }]
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
