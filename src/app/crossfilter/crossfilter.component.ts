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
import * as crossfilter from "crossfilter";

@Component({
  selector: "crossfilter",
  templateUrl: "./crossfilter.component.html",
  styleUrls: ["./crossfilter.component.css"]
})
export class CrossFilter implements OnInit {
  constructor(public http: Http) {}
  ngOnInit() {
    this.renderer();
  }

  renderer() {
    // let headers = new Headers();
    // headers.set('Accept', 'application/csv');
    // headers.set('Access-Control-Allow-Origin', '*');
    // let options = new RequestOptions({ headers: headers });

    // this.http.get("http://localhost:8080/sales.csv", options  ).subscribe((res) => {
    //   console.log(res);
    // })
    // d3.csv("localhost:8080/sales.csv", function(error, data) {
    //   if (error) throw error;
    //   console.log(data);
    // }

    d3
      .select("body")
      .append("svg")
      .attr("width", 960)
      .attr("height", 500);

    var svg = d3.select("svg"),
      margin = { top: 20, right: 20, bottom: 110, left: 40 },
      margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      height2 = +svg.attr("height") - margin2.top - margin2.bottom;

    var parseDate = d3.timeParse("%b %Y");

    var x = d3.scaleTime().range([0, width]),
      x2 = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
      xAxis2 = d3.axisBottom(x2),
      yAxis = d3.axisLeft(y);

    var brush = d3
      .brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush end", brushed);

    var zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", function() {
        //   console.log('zoomed');
      });

    var area = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x(function(d) {
        return x(d.date);
      })
      .y0(height)
      .y1(function(d) {
        return y(d.price);
      });

    var area2 = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x(function(d) {
        return x2(d.date);
      })
      .y0(height2)
      .y1(function(d) {
        return y2(d.price);
      });

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    var focus = svg
      .append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg
      .append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    d3.csv("../assets/sales.csv", type, function(error, data) {
      if (error) throw error;

      x.domain(
        d3.extent(data, function(d) {
          return d.date;
        })
      );
      y.domain([
        0,
        d3.max(data, function(d) {
          return d.price;
        })
      ]);
      x2.domain(x.domain());
      y2.domain(y.domain());

      // console.log(area);
      //FOR LINE GRAPH ABOVE
      focus
        .append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

      //FOR X AXIS OF MAIN GRAPH
      focus
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      //FOR Y AXIS OF MAIN GRAPH
      //   focus.append("g")
      //       .attr("class", "axis axis--y")
      //       .call(yAxis);

      //FOR GRAPH INSIDE SMALL BOX
      context
        .append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

      // context.append("g")
      //     .attr("class", "axis axis--x")
      //     .attr("transform", "translate(0," + height2 + ")")
      //     .call(xAxis2);

      //FOR BRUSHABLE SMALL BOX
      context
        .append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

      // svg.append("rect")
      //     .attr("class", "zoom")
      //     .attr("width", width)
      //     .attr("height", height)
      //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      //     .call(zoom);
    });

    function brushed() {
      // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3.event.selection || x2.range();
      console.log(s);
      // console.log(s.map(x2.invert, x2))
      x.domain(s.map(x2.invert, x2));
      // console.log(focus.select(".area"));
      // console.log(focus);
      focus.select(".area").attr("d", area);
      // focus.select(".axis--x").call(xAxis);
      //  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      //  .scale(width / (s[1] - s[0])));
      //.translate(-s[0], 0));
    }

    // function zoomed() {
    //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    //   var t = d3.event.transform;
    //   x.domain(t.rescaleX(x2).domain());
    //   focus.select(".area").attr("d", area);
    //   focus.select(".axis--x").call(xAxis);
    //   context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    // }

    function type(d) 
    {
      d.date = parseDate(d.date);
      d.price = +d.price;
      return d;
    }
  }
}
