import React from 'react';
import { connect } from 'react-redux';
import { startDragDraw, updateDragDraw, endDragDraw, toggleCurrentShape, checkIfNewLayerIsValid, changeActiveLayerAndShape, loopAll, loopLayer } from '../Actions/actions';
import ShapeUtil from "../Util/ShapeUtil";
import Layer from './Layer';
import Axes from './Axes';
// Handles svg mouse events. Drag draw etc. Dispatches actions for user drawing.

class Chart extends React.Component {
  constructor() {
    super();

    // slight lag on mousemove updates so throttling the action to be dispatched every "x" (guessed from trial and error) events. Declaring local state because throttle not really needed elsewhere (yet).

    this.state = {
      throttle: 0,
    }
  }

  // componentDidMount() {
  //   window.addEventListener("keydown", , false);
  // }

  onMouseDown(e) {
    document.activeElement.blur();
    e.preventDefault();

    // yeah so I can't bind a click event on both svg and it's child. yet. so have to fire it from here. fuck.
    if (e.target.classList.contains("shape")) {
      this.props.changeActiveLayerAndShape(e.target.id);
      return;
    }

    this.props.onMouseDown(e);
  }

  render () {
    const drawing = this.props.drawing;
    const chartWidth = drawing["overallAttributes$chartWidth$value"];
    const chartHeight = drawing["overallAttributes$chartHeight$value"];
    const onMouseDown = this.props.onMouseDown;
    const onMouseMove = this.props.onMouseMove;
    const onMouseUp = this.props.onMouseUp;
    const checkIfNewLayerIsValid = this.props.checkIfNewLayerIsValid;
    const currentShape = drawing.currentShape;
    const layerIds = drawing.layerIds;
    const beingDrawn = drawing.beingDrawn;
    const marginLeft = (drawing["overallAttributes$marginLeft$value"] !== undefined) ? drawing["overallAttributes$marginLeft$value"] : 0;
    const marginTop = (drawing["overallAttributes$marginTop$value"] !== undefined) ? drawing["overallAttributes$marginTop$value"] : 0;
    const marginRight = (drawing["overallAttributes$marginRight$value"] !== undefined) ? drawing["overallAttributes$marginRight$value"] : 0;
    const marginBottom = (drawing["overallAttributes$marginBottom$value"] !== undefined) ? drawing["overallAttributes$marginBottom$value"] : 0;

    const overallStyles = ShapeUtil.getAllOverallAttributesStylesProperty(drawing, "value");

    // SVG doesn't support ondrag events so have to work with mousedown, mousemove and mouseup here.

    return (
      <div id="chart-container">
        <svg 
          id="chart"
          width={chartWidth + marginRight + marginLeft}
          height={chartHeight + marginBottom + marginTop}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseMove={(e) => {
            e.preventDefault();

            if(beingDrawn) {
              if(this.state.throttle % 1 === 0)
              {
                onMouseMove(e);
              }

              this.setState({
                throttle: this.state.throttle + 1
              });
            }
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            if(beingDrawn) {
              checkIfNewLayerIsValid();
              onMouseUp(e);
            }

            this.setState({
              throttle: 0
            }) 
          }}
          style={overallStyles}
          >
          <rect width={chartWidth + marginLeft + marginRight} height={chartHeight + marginTop + marginBottom} fill="#fff"></rect>

          <Axes
            chartWidth={chartWidth}
            chartHeight={chartHeight}
            marginLeft={marginLeft}
            marginTop={marginTop}
            marginRight={marginRight}
            marginBottom={marginBottom}
          />

          {layerIds.map((layerId, i) =>
            <g key={i} id={layerId} transform={"scale(1, -1) translate("+ marginLeft +"," + (-chartHeight - marginTop) + ")"}>
              <Layer className="layer" id={layerId} type={drawing[layerId + "$type"]} attributeList={drawing[layerId + "$attributeList"]} />
            </g>
          )}

        </svg>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    "drawing": state.drawing,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onMouseDown: (e) => {
      dispatch(startDragDraw(e));
    },
    onMouseMove: (e) => {
      dispatch(updateDragDraw(e));
    },
    onMouseUp: (e) => {
      dispatch(endDragDraw(e));
    },
    checkIfNewLayerIsValid: (e) => {
      dispatch(checkIfNewLayerIsValid());
    },
    changeActiveLayerAndShape: (shapeId) => {
      dispatch(changeActiveLayerAndShape(shapeId));
    }
  }
}

Chart = connect(mapStateToProps, mapDispatchToProps)(Chart);

export default Chart;