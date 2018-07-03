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

@Component({
  selector: "app-clean-well-log",
  templateUrl: "./clean-well-log.component.html",
  styleUrls: ["./clean-well-log.component.css"]
})
export class CleanWellLogComponent implements OnInit {
  constructor(public http: Http) {}

  axis;
  ip = "http://192.168.1.8:8615/";
  apiRoot = "document/";
  options;
  mnemonics;
  ArrayOfFiles = [];
  selectedPars = [];
  graphData;
  wellHeight;
  logHeight = 900;
  y;
  extent;
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

        this.extent = jsonInput['DEPT'];
     
        


        // d3
        // .line()
        // .x(function(d) {
        //   return x(d.x);
        // })
        // .y(function(d) {
        //   return y(d.y);
        // });
        // console.log(jsonInput['DEPT']);
        //   this.mnemonics = Object.keys(jsonInput);
        //   this.mnemonics.splice(0,1);
        // console.log(this.ArrayOfFiles);
        //   this.graphData = ByteArray;
        //this.generateGraph(ByteArray);
      },
      err => console.log(err)
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

    ArrayOfFiles.forEach(element => {
      try {
        var jsonInput = JSON.parse(element.graphData);
      } catch (excep) {
        var jsonInput = element.graphData;
      }

      var mnemonics = Object.keys(element.selectedParameters);
      var numberOfMnemonics = mnemonics.length;
      var margin = { top: 20, right: 20, bottom: 20, left: 60 };

      var boxStrokeWidth = 2;
      var pathStrokeWidth = 1;
      var logLegendHeight = 50;
      var logLegendWidth = 200;
      var logWidth = logLegendWidth;
      var logBoxVerticalOffset = logLegendHeight;
      var logBoxHorizontalOffset = logLegendWidth;
      var wellOffsetY = 50;
      // var wellWidth = (element.selectedParameters.length) * logWidth + 50;
      var wellWidth = logWidth + 50;
      this.wellHeight = logLegendHeight + this.logHeight;

      let classname = element.name.slice(0, element.name.length-4);

      var svg = d3
        .select("#WellLogGraph")
        .append("svg")
        .attr('class', classname)
        .attr("width", wellWidth)
        .attr("height", this.wellHeight);




      
        
      
      //let rect = svg.append('rect').attr('width', 50).attr('height', wellHeight);
      //svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Set up the depth axis log data once as it will be used for each other log in the well

      var depthData = jsonInput[element.parameters[0]];
      // console.log(d3.extent(depthData));
      
      //var y = d3.scaleLinear().range([0, logHeight]).domain(478,6862);

      var yAxis = d3
        .axisLeft()
        .scale(y)
        .ticks(50);

      var wellBoxData = [
        { x: 0, y: 0 },
        { x: wellWidth, y: 0 },
        { x: wellWidth, y: this.wellHeight },
        { x: 0, y: this.wellHeight },
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
        { x: logWidth, y: this.logHeight },
        { x: 0, y: this.logHeight },
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

    

      var frameIndex = 0;

      // });
      for (var i = 0; i < element.selectedParameters.length; i++) {
        // ArrayOfFiles.forEach(element => {
          var inputLogData = jsonInput[element.selectedParameters[i]];

          var y = d3
          .scaleLinear()
          .range([0, this.logHeight])
          .domain(d3.extent(jsonInput[element.parameters[0]]));
  
          var x = d3
            .scaleLinear()
            .range([0, logWidth])
            .domain(d3.extent(inputLogData));

            console.log(d3.extent(inputLogData));
  
  
            var valueLine = d3
          .line()
          .x(function(d) {
            return x(d.x);
          })
          .y(function(d) {
            return y(d.y);
          });
        // });
        let parameter = element.selectedParameters[i];

        // var loopself = this;
        // var translationX = logLegendWidth * (i);
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

        if (!this.axis) {
          this.axis = svg
            .append("g")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(y));
        }

        // svg.append('g').append('rect').attr('height', wellHeight).attr('width', 50).attr('fill', 'white')

        svg
          .append("text")
          .attr("x", translationX + 80 * i)
          .attr("y", 30)
          .attr("fill", "red")
          .data(element.selectedParameters)
          .text(d => {
            let text = element.selectedParameters[i];
            return text;
          });

        // svg
        //   .append("text")
        //   .attr("x", 0)
        //   .attr("y", 0)
        //   .attr("dy", "30em")
        //   .attr("text", function() {
        //     console.log(mnemonics[i]);
        //     return mnemonics[i];
        //   });

        //svg.append('rect').attr('height', wellHeight).attr('width', 50).attr('fill', 'white')

        // svg
        //     .append("path")
        //     .attr("d", box(logBoxData))
        //     .attr("stroke", "pink")
        //     .attr("stroke-width", pathStrokeWidth)
        //     .attr("fill", "none")
        //     .attr("transform", logTranslationDistanceString);

        
        var xAxis = d3
          .axisBottom()
          .scale(x)
          .ticks(5);
        var logData = getLogData(depthData, inputLogData);


        // let classstring = element.selectedParameters[i].slice(element.selectedParameters[i].length, 4)

        svg
          .append("path")
          .datum(logData)
          // .attr("class", "area")
          .attr('class', element.selectedParameters[i] )
          .attr("d", valueLine)
          // .attr("d", valueLine(logData)) // This is incorrect
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

        //   svg
        //     .append("path")
        //     .attr("class", "y axis")
        //     .attr("stroke", "green")
        //     .attr("stroke-width", pathStrokeWidth)
        //     .attr("transform", logTranslationDistanceString)
        //     .call(d3.axisLeft(y));
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




    var context = d3.select("#WellLogGraph").select('svg')
          .append("g")
          .attr("class", "context")
          .attr("transform", "translate(0,0)");

        var brush = d3
          .brushY()
          .extent([[0, 0], [50, this.wellHeight]])
          .on("brush end", brushed);




        function  brushed() {

          
            // console.log(depthData.length);
            
        //     // let x2 = d3.scaleLinear().domain([0, logData.length]).range([0, wellHeight]);
        //     // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") {
        //     //   return; // ignore brush-by-zoom
        //     // }
            // var s = d3.event.selection || x2.range();
        //     // console.log(x2.range());
        //     // console.log(x2(5));
        //     // console.log(x2.invert(5));
            //  console.log(s);
            // var y = d3
            // .scaleLinear()
            // .range([0, self.logHeight])
            // .domain(d3.extent(self.extent[0]));
        //     console.log(s);
        //     // // console.log((x2.invert, x2));
        //     console.log((s.map(x2, x2.invert)));
        //     // let funcy = x.domain(s.map(100,50));
        //     // console.log(funcy(5));
        //     // if (!self.valueLine) {
        //     //   self.valueLine = d3
        //     //     .line()
        //     //     .x(function(d) {
        //     //       return x(d.x);
        //     //     })
        //     //     .y(function(d) {
        //     //       return y(d.y);
        //     //     });
        //     // }
        //     //  console.log( self.brushFocus.select('g'));
        //     // try {
        //     //    //=166
        
        //     d3.select('')
            // self.brushFocus.attr("d", self.valueLine);
            // console.log(self.brushFocus);
            // }

            self.ArrayOfFiles.forEach(element => {
              var localgraphdata = JSON.parse(element.graphData);
              let localdepthdata = localgraphdata['DEPT'];

              let x2 = d3
            .scaleLinear()
            .range([0, self.logHeight])
        
            .domain([0,(localdepthdata[localdepthdata.length-1])]);

              let selectstring = '.' + element.name.slice(0, element.name.length-4);
              let ddd = d3.select(selectstring);
               var y = d3
                 .scaleLinear()
                 .range([0, window.innerHeight])
                 .domain(d3.extent(localgraphdata[element.parameters[0]]));
                 var s = d3.event.selection;
                 console.log(s);

                 let funcy = y.domain(s.map(x2.invert, x2));

              element.selectedParameters.forEach(data => {
               

                var x = d3
                .scaleLinear()
                .range([0, 200])
                .domain(d3.extent(localgraphdata[data]));
              let  valueLine = d3
                .line()
                .x(function(d) {
                  return x(d.x);
                })
                .y(function(d) {
                  return y(d.y);
                });


                // console.log(selectstring);
                // console.log(d3.select("#WellLogGraph").selectAll('svg'));
                // let sfsd = d3.select("#WellLogGraph").selectAll('svg');
                // let fff = d3.selectAll('svg');
                // console.log(ddd);
                let selector = '.' + data;
               let selected = ddd.select(selector)
              //  let ttt =  ddd.select(selectstring)
              selected.attr('d', valueLine);
              });
            });

                                            //   let svgs = d3.select("#WellLogGraph").selectAll('svg');
                                            //   console.log(svgs);
                                            //   if(svgs.length>0) {
                                            //   svgs.forEach(element => {
                                            //     element.select('.area');
                                            //     console.log(element.select('.area'));

                                            //   });
                                            // }

                                            // else {
                                            //   console.log(svgs.select('.area'));
                                            //   // svgs.select('.area').attr('d', valueLine)
                                            // }
        
            // catch(execption) {
        
            //   let node = d3.select('body').select('svg').select('.area');
            //   console.log(node);
            //   node.attr('d', self.valueLine);
            // //   console.log(self.brushFocus.select('g')); //=166
        
            // //   let g = self.brushFocus.selectAll('g');
            // //   let h = g.select('.focus');
            // //   h.attr("d", self.valueLine);
            // }
            // focus.select(".axis--x").call(xAxis);
            //  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            //  .scale(width / (s[1] - s[0])));
            //.translate(-s[0], 0));
            // console.log('brushing');
          }
         let xxx =this.ArrayOfFiles[0].graphData[this.ArrayOfFiles[0].parameters[0]];
        // console.log(xxx);
          var y = d3
          .scaleLinear()
          .range([0, this.logHeight])
          .domain(d3.extent(this.extent));


        context
          .append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, y.range());

    // var brush = d3
    //       .brushY()
    //       .extent([[0, 0], [50, this.wellHeight]])
    //       .on("brush end", this.brushed(this.ArrayOfFiles[0].parameters[0]));
  }


}
