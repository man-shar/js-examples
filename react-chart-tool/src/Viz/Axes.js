import React from "react";
import { connect } from "react-redux";
import ShapeUtil from "../Util/ShapeUtil";
import Axis from './Axis';
import * as d3 from "d3";

// axis.scale([scale])
// axis.ticks(arguments…) 
// axis.tickArguments([arguments])
// axis.tickValues([values])
// axis.tickFormat([format])
// axis.tickSize([size])
// axis.tickSizeInner([size])
// axis.tickSizeOuter([size])
// axis.tickPadding([padding])

class Axes extends React.Component {
  render() {
    const xScale = ShapeUtil.scales["xAxis"];
    const yScale = ShapeUtil.scales["yAxis"];
    const { chartWidth, chartHeight, marginLeft, marginTop, marginRight, marginBottom } = this.props;

    return (
      <g class="axes">
        <Axis
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          marginLeft={marginLeft}
          marginTop={marginTop}
          marginRight={marginRight}
          marginBottom={marginBottom}
          scale={xScale}
          orientationFunc={d3.axisBottom}
          orientationName={"bottom"}
          id="x-axis"/>

        <Axis
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          marginLeft={marginLeft}
          marginTop={marginTop}
          marginRight={marginRight}
          marginBottom={marginBottom}
          scale={yScale}
          orientationFunc={d3.axisLeft}
          orientationName={"left"}
          id="y-axis"/>
      </g>
    );
  }
}

export default Axes;
