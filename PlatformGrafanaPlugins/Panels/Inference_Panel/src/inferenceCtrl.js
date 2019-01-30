import {MetricsPanelCtrl} from "app/plugins/sdk";
import _ from "lodash";
import TimeSeries from "app/core/time_series2";
import coreModule from "app/core/core_module";
import kbn from "app/core/utils/kbn";
import moment from "moment";
var google;
const panelDefaults = {
	primary: 1,
	open: false,
	showHoverChart: false,
	scrollable: true,
	happy_img: 'public/plugins/Inference_panel/img/happy.svg',
	sad_img: 'public/plugins/Inference_panel/img/sad.svg'
};
export class InferenceCtrl extends MetricsPanelCtrl {
	/** @ngInject */

	constructor($scope, $injector) {
		super($scope, $injector);
		_.defaultsDeep(this.panel, panelDefaults);
		
		this.events.on('render', this.onRender.bind(this));
		this.events.on('refresh', this.postRefresh.bind(this));
		this.events.on('data-error', this.onDataError.bind(this));
		this.events.on('data-received', this.onDataReceived.bind(this));
		this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
		this.googleChartData = {};
		this.panel.showHoverChart = false;

	}
	
	postRefresh() {
				
	}
	onInitEditMode() {
		this.addEditorTab('Options', './editor.html', 2);	
	}
	onRender() {
		google = window['google'];
		google.charts.load('current', {packages: ['corechart']});     
		
		//this.hoverOn();
	}
	onDataReceived(dataList) {
		this.uiResponseArr = [];
		this.jsonArrtoStr = dataList;
		this.singleVectorKpiDetails = []
		
		
		for(let i = 0; i < this.jsonArrtoStr.length; i++) 
			{
			this.arr = [];
			this.vectorMap = {};
			this.vectorMap["vectorName"] = this.jsonArrtoStr[i]["heading"];
			this.jsonObjtoStr = this.jsonArrtoStr[i];
			for (var vector in this.jsonObjtoStr["inferenceDetails"]) {	
				this.data = this.jsonObjtoStr["inferenceDetails"][vector];			
				this.vectorProperty = {};

				this.googleChartData[this.data["kpiId"]] = this.data["resultSet"];

				this.vectorProperty["kpi"]=this.data["kpi"];
				this.vectorProperty["sentiment"]=this.data["sentiment"];
				this.vectorProperty["kpiId"]=this.data["kpiId"];
				this.vectorProperty["trendline"]=this.data["trendline"];
				this.vectorProperty["inference"]=this.data["inference"];
				this.vectorMap["lastRun"]=this.data["lastRun"];
				if(this.data["sentiment"] == "POSITIVE" && this.data["trendline"] == "High to Low"){
					this.vectorProperty["color"]="green";
					this.vectorProperty["type"]="increased";
					
					this.googleChartData[this.data["kpiId"]].push("green");
				}
				else if(this.data["sentiment"] == "POSITIVE" && this.data["trendline"] == "Low to High"){
					this.vectorProperty["color"]="green";
					this.vectorProperty["type"]="increased";

					this.googleChartData[this.data["kpiId"]].push("green");
				}
				else if(this.data["sentiment"] == "NEGATIVE" && this.data["trendline"] == "Low to High"){
					this.vectorProperty["color"]="red";
					this.vectorProperty["type"]="increased";

					this.googleChartData[this.data["kpiId"]].push("red");
				}
				else if(this.data["sentiment"] == "NEGATIVE" && this.data["trendline"] == "High to Low"){
					this.vectorProperty["color"]="red";
					this.vectorProperty["type"]="decreased";

					this.googleChartData[this.data["kpiId"]].push("red");
				}
				else if(this.data["sentiment"] == "NEUTRAL"){
					this.vectorProperty["color"]="green";
					this.vectorProperty["type"]="same";

					this.googleChartData[this.data["kpiId"]].push("green");
				}
				this.arr.push(this.vectorProperty);
			}
			this.vectorMap["data"] = this.arr;
			this.uiResponseArr.push(this.vectorMap);
	}
		
		
		this.onRender();
		
	}
	onDataError() {
		
	}
	openCollapse() {
		this.show=true;
		var coll = document.getElementsByClassName("collapsible");
		var i;

		for (i = 0; i < coll.length; i++) {
			coll[i].addEventListener("click", function() {
				this.classList.toggle("active");
				var content = this.nextElementSibling;
				if (content.style.display === "block") {
				content.style.display = "none";
				} else {
				content.style.display = "block";
				}
			});
		}
	}
	filterData(x){
		
		this.drawArr = [];
		this.col = ['Value', '', { role: 'style' }];
		this.drawArr.push(this.col);
		
		this.c = this.googleChartData[x][this.googleChartData[x].length - 1]
		for (var data in this.googleChartData[x]){
			this.arr = [];
			this.arr.push(this.googleChartData[x][data]["resultDate"]);
			this.arr.push(this.googleChartData[x][data]["value"]);
			this.arr.push(this.c);
			this.drawArr.push(this.arr);
		}
		
		return this.drawArr;
	}
	hoverOn(x, title, vectorName) {

		


		this.panel.primary +=1;
		this.panel.showHoverChart = true;
		var options = {'title':title};
		this.arr = [];
		
		// this.arr.push(this.filterData(x));
		var data = new google.visualization.DataTable();
		var data = google.visualization.arrayToDataTable(this.filterData(x));
		
		 google.charts.setOnLoadCallback(this.drawCharts.bind(this));
		 // Instantiate and draw the chart.
		 
		 if(this.panel.targets[0].chartType == "LineChart"){
			var chart = new google.visualization.LineChart(document.getElementById(this.panel.id));
		 }
		 else if(this.panel.targets[0].chartType == "BarChart"){
			var chart = new google.visualization.BarChart(document.getElementById(this.panel.id));
		 }
		 if(window['grafanaBootData'].user.lightTheme){
			options['backgroundColor'] = '#ffffff';
			options['legendTextStyle'] = {color: 'black'};
			options['titleTextStyle'] = {color: 'black'};
		
			
		 }
		 else{
			options['backgroundColor'] = '#212124';
			options['legendTextStyle'] = {color: 'white'};
			options['titleTextStyle'] = {color: 'white'};
		 }
		  //var chart = new google.visualization.BarChart(document.getElementById(this.panel.id));
		//  google.visualization.events.addOneTimeListener(chart, 'ready', function(){
		// 	 console.log("--------------");
		// 	chart.draw(data, options);
		//  });
		
		chart.draw(data, options);
	}
	hoverOut(x)
	{
		document.getElementById(x).style.display = 'none'
		
		this.panel.showHoverChart = false;
		
	}
	drawCharts(){
		// var options = {title: 'Date Wise Trend'}; 
		// console.log(options);
		// var data = google.visualization.arrayToDataTable([
		// 	['Date', 'No.'],
		// 	['Jan 20, 2019 6:40:26 PM',  900],
		// 	['Jan 19, 2019 6:40:26 PM',  1050],
		// 	['Jan 18, 2019 6:40:27 PM',  1100]
		//  ]);
		// var chart = new google.visualization.BarChart(document.getElementById("abc"));
		// // google.visualization.events.addOneTimeListener(chart, 'ready', function(){
			
		// // 	chart.draw(data, options);
		// // });
		// console.log("before chart.draw");
		// chart.draw(data, options);
		// console.log("after chart.draw");
	}
}
InferenceCtrl.templateUrl = 'module.html';