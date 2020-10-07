import React from "react";
import { connect } from "react-redux";
import ShapeUtil from "../Util/ShapeUtil";

class Line extends React.Component {
  render() {
    const shapeId = this.props.id;
    const layerId = this.props.layerId;
    const index = this.props.index;
    const drawing = this.props.drawing;

    const dimensionList = ShapeUtil.allDimensions[drawing[shapeId + '$type']];
    const styleList = ShapeUtil.allStyles[drawing[shapeId + '$type']];

    const shapeStyleObject = styleList.reduce((acc, style) => {
      acc[style] = ShapeUtil.getShapeStyleProperty(style, shapeId, layerId, drawing, "value");
      return acc;
    }, {});

    const shapeDimensionObject = dimensionList.reduce((acc, dimension) => {
      acc[dimension] = ShapeUtil.getShapeDimensionProperty(dimension, shapeId, layerId, drawing, "value");
      return acc;
    }, {});

    return (
      <path
        id={shapeId}
        className="shape"
        index={index}
        name={this.props.drawing[shapeId + "$name"]}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    drawing: state.drawing,
  };
};

Line = connect(mapStateToProps)(Line);

export default Line;
