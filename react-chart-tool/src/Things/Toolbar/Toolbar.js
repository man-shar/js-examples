import React from "react";
import { connect } from "react-redux";
import ShapeUtil from "../../Util/ShapeUtil"

class Toolbar extends React.Component {
  render() {
    const currentShape = this.props.currentShape;
    const knownShapes = ShapeUtil.knownShapes;
    const loopKeyCombinations = ShapeUtil.loopKeyCombinations;
    const loopKeyCombinationsFunctions = ShapeUtil.loopKeyCombinationsFunctions;

    return (
      <div id="ToolbarFlexContainer">
        {
          knownShapes.map((shape) => {
            const className = "ToolbarItemFlex " + ((currentShape === shape) ? "activeToolbarItem" : "");
            return (
              <div className={className}>
                <div className="toolbar-key">
                  <span>{shape.substr(0, 1)}</span>
                </div>
                <span>{shape}</span>
              </div>
            )
          })
        }
        {
          loopKeyCombinations.map((loopKeyCombination) => {
            const className = "ToolbarItemFlex";
            return (
              <div className={className}>
                <div className="toolbar-key">
                  <span>{loopKeyCombination}</span>
                </div>
                <span>{loopKeyCombinationsFunctions[loopKeyCombination]}</span>
              </div>
            )
          })
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentShape: state["drawing"]["currentShape"],
  };
};

Toolbar = connect(mapStateToProps)(Toolbar);

export default Toolbar;
