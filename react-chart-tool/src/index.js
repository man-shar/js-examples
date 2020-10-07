import React from "react";
import { render } from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import logger from "redux-logger";
import thunkMiddleware from "redux-thunk";
import manageActions from "./Reducers/reducer";
import { toggleCurrentShape, loopLayer, loopAll } from "./Actions/actions";
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { reduxBatch }  from '@manaflair/redux-batch';
import { connect } from 'react-redux';
import keydown from 'react-keydown';
import ShapeUtil from "./Util/ShapeUtil";
import 'codemirror/lib/codemirror.css'
import "./styles/styles.css";
import "./styles/shapeStyles.css";

let store = createStore(
  manageActions,
  reduxBatch,
  applyMiddleware(thunkMiddleware),
  reduxBatch
);

import Things from "./Things/Things";
import Viz from "./Viz/Viz";

class App extends React.Component {
  @keydown(ShapeUtil.keysToShapes)
  toggleCurrentShape(event) {
    this.props.toggleCurrentShape(event);
  }

  @keydown(ShapeUtil.loopKeyCombinations)
  loopKeyCombination(event) {
    event.preventDefault();
    this.props.loopKeyCombination(event, this.props.drawing["activeLayerId"]);
  }

  render() {
    return (
        <div id="main-container">
          <Viz />
          <Things />
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
    toggleCurrentShape: (e) => {
      dispatch(toggleCurrentShape(e.key));
    },
    loopKeyCombination: (e, layerId) => {
      if(e.shiftKey)
      {
        dispatch(loopAll());
      }
      else
        dispatch(loopLayer(layerId));
    }
  }
}

App = connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(App));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
