import React from "react";
import { connect } from "react-redux";
import Rect from "./Rect";
import Circle from "./Circle";

class Layer extends React.Component {
  render() {
    const layerId = this.props.id;
    const shapeIds = this.props.drawing[layerId + "$shapeIds"];
    const type = this.props.drawing[layerId + "$type"];
    const drawing = this.props.drawing;

    if (type === "rect") {
      return shapeIds.map((shapeId, i) => (
        <Rect
          id={shapeId}
          index={this.props.drawing[shapeId + "$index"]}
          layerId={layerId}
          key={i}
        />
      ));
    }

    if (type === "circle") {
      return shapeIds.map((shapeId, i) => (
        <Circle
          id={shapeId}
          index={this.props.drawing[shapeId + "$index"]}
          layerId={layerId}
          key={i}
        />
      ));
    }
  }
}

const mapStateToProps = state => {
  return {
    drawing: state.drawing
  };
};

Layer = connect(mapStateToProps)(Layer);

export default Layer;
