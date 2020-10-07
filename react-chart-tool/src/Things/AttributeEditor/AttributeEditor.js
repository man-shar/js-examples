import React from "react";
import { connect } from "react-redux";
import OverallAttributeEditor from "./OverallAttributeEditor";
import LayerAttributeEditor from "./LayerAttributeEditor";
import ShapeAttributeEditor from "./ShapeAttributeEditor";

// Attributes are both dimensions and styles.

class AttributeEditor extends React.Component {
  render() {
    const { activeLayerId, activeShapeId, drawing } = this.props;

    return (
      <div id="attribute-container">
        <div className="things-label" draggable="true">
          Attributes
        </div>
        <div className="AttributesSectionHeading">
          <span>Default Attributes</span>
        </div>
        <OverallAttributeEditor />
        <LayerAttributeEditor layerId={activeLayerId} />
        <ShapeAttributeEditor shapeId={activeShapeId} layerId={activeLayerId}/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeLayerId: state["drawing"]["activeLayerId"],
    activeShapeId: state["drawing"]["activeShapeId"],
    drawing: state["drawing"]
  };
};

AttributeEditor = connect(mapStateToProps)(AttributeEditor);

export default AttributeEditor;
