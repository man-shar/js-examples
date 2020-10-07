import React from "react";
import { connect } from "react-redux";
import ShapeUtil from "../Util/ShapeUtil";

class Circle extends React.Component {
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
      <circle
        id={shapeId}
        className="shape"
        index={index}
        name={this.props.drawing[shapeId + "$name"]}
        {...shapeDimensionObject}
        style={shapeStyleObject}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    drawing: state.drawing,
  };
};

Circle = connect(mapStateToProps)(Circle);

export default Circle;
