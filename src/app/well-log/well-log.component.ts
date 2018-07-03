import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";
import * as d3 from "d3";
import {
  Http,
  RequestOptions,
  Headers,
  ResponseContentType
} from "@angular/http";
import { HttpClient } from "@angular/common/http";
import { element } from "protractor";
import { CrossFilter } from "../crossfilter/crossfilter.component";
import * as crossfilter from "crossfilter";

@Component({
  selector: "app-well-log",
  templateUrl: "./well-log.component.html",
  styleUrls: ["./well-log.component.css"]
})
export class WellLogComponent implements OnInit {
  constructor(public http: Http) {}

  axis;
  ip = "http://192.168.1.29:8615/";
  apiRoot = "document/";
  options;
  mnemonics;
  ArrayOfFiles = [];
  selectedPars = [];
  graphData;
  brushFocus;
  valueLine;

  ngOnInit() {
    this.getFileList();
    //d3.select('#WellLogGraph').append('svg').append('image').attr('xlink:href', 'http://localhost:8080//2015-ford-mustang-rtr.jpg')
  }

  getFileList() {
    let url = `${this.ip}${this.apiRoot}GetWellLogList`;
    let headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Access-Control-Allow-Origin", "*");
    this.options = new RequestOptions({ headers: headers });

    this.http.get(url, this.options).subscribe(
      res => {
        // console.log(res);
        this.HandleRes(res);
      },
      err => {
        // console.log(err["_body"]);
      }
    );
  }

  checked(event, data, name) {
    // console.log(event.currentTarget.checked);

    this.ArrayOfFiles.forEach(element => {
      if (element.name === name) {
        if (event.currentTarget.checked) {
          if (element.selectedParameters.indexOf(data) < 0) {
            element.selectedParameters.push(data);
          }
        } else {
          if (element.selectedParameters.indexOf(data) > -1) {
            element.selectedParameters.splice(
              element.selectedParameters.indexOf(data),
              1
            );
          }
        }
      }
    });
    //   let index = this.selectedPars.indexOf(data);
    //   if(event.currentTarget.checked) {
    //       if(index<0) {
    //           this.selectedPars.push(data)
    //       }
    //   }
    //   else if(!event.currentTarget.checked){
    //       if(index>-1) {
    //           this.selectedPars.splice(this.selectedPars.indexOf(data), 1)
    //       }
    //   }

    // console.log(this.ArrayOfFiles);
  }
  FileList;

  HandleRes(res) {
    let dataJson = JSON.parse(res["_body"]);
    this.FileList = dataJson;
  }

  GetFile(file) {
    let self = this;
    document.getElementById("selector").onclick = function(e) {
      if (!e.ctrlKey) {
        self.ArrayOfFiles = [];
      }
    };
    let i = 0;
    // this.fileId = file;
    let url =
      `${this.ip}${this.apiRoot}GetWellLogFile?fileName=` + file.OriginalPath;

    this.http.get(url, this.options).subscribe(
      res => {
        // console.log("Response : " + res);
        let ByteArray = res["_body"];
        let data = { Data: ByteArray, FileName: file };

        // console.log(data);
        var decodedString = String.fromCharCode.apply(
          null,
          new Uint8Array(ByteArray)
        );
        // console.log(decodedString);
        //d3.select("#WellLogGraph").removeAll('svg');
        try {
          var jsonInput = JSON.parse(ByteArray);
        } catch (excep) {
          var jsonInput = ByteArray;
        }
        let name = file.OriginalPath;
        this.ArrayOfFiles.push({
          name: name,
          parameters: Object.keys(jsonInput),
          graphData: ByteArray,
          selectedParameters: []
        });
        //   this.mnemonics = Object.keys(jsonInput);
        //   this.mnemonics.splice(0,1);
        // console.log(this.ArrayOfFiles);
        //   this.graphData = ByteArray;
        //this.generateGraph(ByteArray);
      }
      // err => console.log(err)
    );
    // console.log("getting file");
  }

  submit() {
    d3.selectAll("svg").remove();
    this.generateGraph(this.ArrayOfFiles);
    // this.generateGraph(this.graphData, this.selectedPars);
  }

  generateGraph(ArrayOfFiles) {
    function getLogData(arrayID, arrayText) {
      var newLogData = "[ ";
      //should arrayID length equal arrayText length and both against null
      if (
        arrayID != null &&
        arrayText != null &&
        arrayID.length == arrayText.length
      ) {
        for (var i = 0; i < arrayID.length; i++) {
          if (i < arrayID.length - 1) {
            newLogData +=
              '{ "x" : ' + arrayText[i] + ', "y" : ' + arrayID[i] + " }, ";
          } else {
            newLogData +=
              '{ "x" : ' + arrayText[i] + ', "y" : ' + arrayID[i] + " } ";
          }
        }
      }
      newLogData += "]";
      //console.log(newLogData);
      return JSON.parse(newLogData);
    }

    //     document.body.onclick = function (e) {
    //       if (e.ctrlKey) {
    //       }
    //       else {
    //         d3.selectAll('svg').remove();

    //       }
    //    }
    //d3.select("#WellLogGraph").remove('svg');

    var self = this;

    var bisect = d3.bisector(function(d) {
      // console.log(d)
      return d.y;
    }).left;
    var boxStrokeWidth = 2;
    var pathStrokeWidth = 1;
    var logLegendHeight = 50;
    var logLegendWidth = 250;
    var logWidth = logLegendWidth;
    var logHeight = 900;
    var logBoxVerticalOffset = logLegendHeight;
    var logBoxHorizontalOffset = logLegendWidth;
    var wellOffsetY = 50;
    var wellWidth = logWidth + 50;
    var wellHeight = logLegendHeight + logHeight;
    var svg = d3
      .select("#WellLogGraph")
      .append("svg")
      .attr("width", wellWidth)
      .attr("height", wellHeight);
    // .attr("id", "clip")
    //   .append("rect")
    //     .attr("width", wellWidth)
    //     .attr("height", wellHeight);

    var margin = { top: 20, right: 20, bottom: 20, left: 60 };
    var margin2 = { top: 20, right: 20, bottom: 20, left: 300 };

    ArrayOfFiles.forEach(element => {
      svg.append("g").attr("id", ArrayOfFiles.indexOf(element));
      try {
        var jsonInput = JSON.parse(element.graphData);
      } catch (excep) {
        var jsonInput = element.graphData;
      }

      var mnemonics = Object.keys(element.selectedParameters);
      var numberOfMnemonics = mnemonics.length;

      //let rect = svg.append('rect').attr('width', 50).attr('height', wellHeight);
      //svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Set up the depth axis log data once as it will be used for each other log in the well

      var depthData = jsonInput[element.parameters[0]];
      let crosfilter = crossfilter(jsonInput[element.parameters[0]]);
      // crosfilter.dimension(d => console.log(d));
      crosfilter.groupAll();
      // console.log(d3.extent(depthData));
      var y = d3
        .scaleLinear()
        .range([0, logHeight])
        .domain(d3.extent(depthData));

        console.log(depthData);
      //var y = d3.scaleLinear().range([0, logHeight]).domain(478,6862);
      var yAxis = d3
        .axisLeft()
        .scale(y)
        .ticks(50);

      var wellBoxData = [
        { x: 0, y: 0 },
        { x: wellWidth, y: 0 },
        { x: wellWidth, y: wellHeight },
        { x: 0, y: wellHeight },
        { x: 0, y: 0 }
      ];

      var logLegendBoxData = [
        { x: 0, y: 0 },
        { x: logLegendWidth, y: 0 },
        { x: logLegendWidth, y: logLegendHeight },
        { x: 0, y: logLegendHeight },
        { x: 0, y: 0 }
      ];

      var logBoxData = [
        { x: 0, y: 0 },
        { x: logWidth, y: 0 },
        { x: logWidth, y: logHeight },
        { x: 0, y: logHeight },
        { x: 0, y: 0 }
      ];

      var box = d3
        .line()
        .x(function(d) {
          return d.x;
        })
        .y(function(d) {
          return d.y;
        });

      this.valueLine = d3
        .line()
        .x(function(d) {
          return x(d.x);
        })
        .y(function(d) {
          return y(d.y);
        });

      var valueLine2 = d3
        .line()
        .x(function(d) {
          return x(d.x / 4);
        })
        .y(function(d) {
          return y(d.y);
        });

      // var frameIndex = 0;

      // });
      for (var i = 0; i < element.selectedParameters.length; i++) {
        // ArrayOfFiles.forEach(element => {

        // });
        let parameter = element.selectedParameters[i];

        // var loopself = this;
        // var translationX = logLegendWidth;
        var translationX = 50;

        var legendTranslationDistanceString =
          "translate(" + translationX.toString() + ", 0)";

        var logTranslationDistanceString =
          "translate(" +
          translationX.toString() +
          "," +
          logLegendHeight.toString() +
          ")";

        //   var path = svg.append("rect")
        //                               .attr("x", 0)
        //                               .attr("y", 0)
        //                              .attr("width", logLegendWidth)
        //                              .attr("height", logLegendHeight)
        //                                  .attr("fill", "red")

        let path = svg
          //let path = rect
          .append("path")
          .attr("id", i);

        // svg.append('g').append('path').attr("d", box(logLegendBoxData))
        //     .attr("stroke", "orange")
        //     .attr("stroke-width", pathStrokeWidth)
        //     .attr("fill", "none")
        //     .attr("transform", legendTranslationDistanceString)

        //let depthbox =  svg.append('g').append('rect').attr('height', wellHeight).attr('width', 50).attr('fill', 'white')

        if (!self.axis) {
          self.axis = svg
            .append("g")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(y));
        }

        // svg.append('g').append('rect').attr('height', wellHeight).attr('width', 50).attr('fill', 'white')

        svg
          .append("text")
          .attr("x", translationX + 80)
          .attr("y", 30)
          .attr("fill", "red")
          .data(element.selectedParameters)
          .text(function(d) {
            let text = "";
            element.selectedParameters.forEach(Field => {
              text += Field + " ";
            });
            // console.log(text);
            return text;
          });

        var inputLogData = jsonInput[element.selectedParameters[i]];
        // var x2 = d3.scaleLinear().range([0, wellWidth]);
        // var y2 = d3.scaleLinear().range([wellHeight, 0]);
        var x = d3
          .scaleLinear()
          .range([0, logWidth])
          .domain(d3.extent(inputLogData));
        // y = d3.scaleLinear().range([wellHeight, 0]);
        var xAxis = d3
          .axisBottom()
          .scale(x)
          .ticks(5);
        var logData = getLogData(depthData, inputLogData);
        // console.log(logData);

        self.brushFocus = svg
          // .append('g')
          .append("path")
          .datum(logData)
          .attr("class", "area")
          .attr("d", this.valueLine)
          .attr("index", function(i) {
            return i;
          })

          .on("mouseover", function() {
            focus.style("display", null);
          })
          .on("mouseout", function() {
            focus.style("display", "none");
          })
          .on("mousemove", function() {
            mousemove(path);
          })
          .attr("stroke", "steelblue")
          .attr("stroke-width", pathStrokeWidth)
          .attr("transform", logTranslationDistanceString)
          .attr("fill", "none")
          .on("click", click);

        // var area2 = d3.area()
        // .curve(d3.curveMonotoneX)
        // .x(function(d) {
        //   let x2 = d3.scaleLinear().range([0, 200]);
        //   return x2(d.date);
        //  })
        // .y0(height2)
        // .y1(function(d) { return y2(d.price); });


        
        var context = svg
          .append("g")
          .attr("class", "context")
          .attr("transform", "translate(0,0)");

        var brush = d3
          .brushY()
          .extent([[0, 0], [50, wellHeight]])
          .on("brush end", brushed);

        

        context
          .append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, y.range());

        this.brushFocus
          .append("g")
          .attr("class", "focus")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );
        // var area2 = d3
        //   .area()
        //   .curve(d3.curveMonotoneX)
        //   .x(function(d) {
        //     return x2(d.x);
        //   })
        //   .y0(50)
        //   .y1(function(d) {
        //     return y2(d.y);
        //   });

        //    var x2 = d3.scaleTime().range([0, wellWidth]);
        //    var y2 = d3.scaleLinear().range([wellHeight, 0]);

        // svg.append('rect').attr('width', 100).attr('height', 1000)

        // 	.append("path")
        //     .datum(logData)
        //     .attr("class", "area")
        //     .attr("d", area2);

        svg
          .append("path")
          .attr("class", "y axis")
          .attr("stroke", "green")
          .attr("stroke-width", pathStrokeWidth)
          .attr("transform", logTranslationDistanceString)
          .call(d3.axisLeft(y));
      }
      function brushed() {
          console.log('brushing')
        var x2 = d3
        .scaleLinear()
        .range([0, logHeight])

        .domain([0,(depthData[depthData.length-1])]);

        var s = d3.event.selection;

        console.log(s);
        console.log((s.map(x2, x2.invert)));
       let funcy = y.domain(s.map(x2.invert, x2));
    

        self.brushFocus.attr("d", self.valueLine);

      }

      var focus = svg
        .append("g")
        .attr("class", "focus")
        .style("display", "none");
      focus.append("circle").attr("r", 3);

      var text = focus
        .append("text")
        .attr("x", 9)
        .attr("dy", ".31em");

      text
        .append("tspan")
        .attr("x", 9)
        .attr("dy", "1.5em");

      text
        .append("tspan")
        .attr("x", 9)
        .attr("y", 5)
        .attr("dy", ".20em");

      svg
        .append("path")
        .attr("d", box(wellBoxData))
        .attr("stroke", "red")
        .attr("stroke-width", boxStrokeWidth * 2)
        .attr("fill", "none");
      svg
        .append("path")
        .attr("class", "x axis")
        .attr("stroke", "yellow")
        .attr("stroke-width", pathStrokeWidth)
        .attr("transform", logTranslationDistanceString)
        .call(xAxis);

      svg.selectAll("line").append("line");

      function click(d, i) {
        var g = d;
        var coords = d3.mouse(this);
      }

      // function barChart() {
      //     // if (!barChart.id) barChart.id = 0;

      //     var margin = {top: 10, right: 10, bottom: 20, left: 10},
      //         x,
      //         y = d3.scale.linear().range([100, 0]),
      //         // id = barChart.id++,
      //         axis = d3.svg.axis().orient("bottom"),
      //         brush = d3.svg.brush(),
      //         brushDirty,
      //         dimension,
      //         group,
      //         round;
      //         return d3.rebind(chart, brush, "on");

      // }

      // var charts = [

      //     barChart()
      //         .dimension(hour)
      //         .group(hours)
      //       .x(d3.scale.linear()
      //         .domain([0, 24])
      //         .rangeRound([0, 10 * 24]))
      // ]

      function mousemove(path) {
        // console.log(index);
        //  let x = d3.select(svg).attr('index');
        let index = path.attr("id");
        // let rect = d3.semouseTargetEventlect('rect')
        var mouseTargetEvent = d3.mouse(svg.node());
        var x0 = y.invert(mouseTargetEvent[1]);
        // console.log(x0)

        var i = bisect(logData, x0, 1);
        var d0 = logData[i - 1],
          d1 = logData[i];
        // console.log(i);
        //    try {
        var d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        //    }
        //    catch (ex) {
        //    }

        //focus.attr("transform", "translate(" + mouseTargetEvent[0] + "," + mouseTargetEvent[1] + ")");
        focus.attr(
          "transform",
          "translate(" + mouseTargetEvent[0] + "," + mouseTargetEvent[1] + ")"
        );

        focus
          .select("text")
          .select("tspan:nth-child(1)")
          .text(function() {
            let text = element.parameters[0] + ":" + d.y;
            return text;
          });

        focus
          .select("text")
          .select("tspan:nth-child(2)")
          .text(function() {
            let text = element.selectedParameters[index] + ":" + d.x;
            return text;
          });
      }
    });

    var combinedD = "";
    d3
      .select("svg")
      .selectAll("path")
      .each(function() {
        combinedD += d3.select(this).attr("d");
      });
  }
}
