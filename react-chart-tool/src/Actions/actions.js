import * as d3 from "d3";
import ShapeUtil from "../Util/ShapeUtil";
import Util from "../Util/Util";

export const INITIALISE_LAYER_FROM_DRAG = "initialise-layer-from-drag";
export const UPDATE_DRAG_DRAW = "update-drag-draw";
export const END_DRAG_DRAW = "end-drag-draw";
export const TOGGLE_CURRENT_SHAPE = "toggle-current-shape";
export const READ_FILE = "read-file";
export const FILE_LOADED_AND_PARSED = "file-loaded-and-parsed";
export const CHANGE_ATTRIBUTE_EXPRESSION_STRING =
  "change-attribute-expression-string";
export const ADD_ATTRIBUTE_REFERENCE_TO_ATTRIBUTE =
  "add-attribute-reference-to-attribute";
export const UPDATE_HOVERED_ATTRIBUTE = "update-hovered-attribute";
export const DELETE_ACTIVE_LAYER = "delete-active-layer";
export const CHANGE_ACTIVE_LAYER_AND_SHAPE = "change-active-layer-and-shape";
export const UPDATE_DEPENDENTS_VALUES = "update-dependents-values";
export const ADD_ATTRIBUTE_TO_OWN_ATTRIBUTES =
  "add-attribute-to-own-attributes";
export const ADD_DATA_COLUMNS_TO_ATTRIBUTES = "add-data-columns-to-attributes";
export const UPDATE_ATTRIBUTE_VALUE = "update-attribute-value";
export const LOOP_LAYER = "loop-layer";
export const CREATE_NEW_SHAPE = "create-new-shape";

export function initialiseLayerFromDrag(e) {
  const action = {
    type: INITIALISE_LAYER_FROM_DRAG,
    e: e,
  };
  return action;
}

export function startDragDraw(e) {
  return (dispatch, getState) => {
    dispatch(initialiseLayerFromDrag(e));

    // get latest state;
    const state = getState();

    dispatch(createNewShape(state["drawing"]["activeLayerId"]));
  };
}

export function updateDragDraw(e) {
  const action = {
    type: UPDATE_DRAG_DRAW,
    e: e,
  };
  return action;
}

export function endDragDraw(e) {
  const action = {
    type: END_DRAG_DRAW,
    e: e,
  };
  return action;
}

export function createNewShape(layerId) {
  const action = {
    type: CREATE_NEW_SHAPE,
    layerId: layerId,
  };

  return action;
}

export function toggleCurrentShape(newShape) {
  const action = {
    type: TOGGLE_CURRENT_SHAPE,
    newShape: newShape,
  };
  return action;
}

export function fileLoadedAndParsed(fileAsText, fileObj, parsed) {
  const action = {
    type: FILE_LOADED_AND_PARSED,
    fileAsText: fileAsText,
    fileObj: fileObj,
    parsed: parsed,
  };
  return action;
}

export function addDataColumnsToAttributes(parsed) {
  const action = {
    type: ADD_DATA_COLUMNS_TO_ATTRIBUTES,
    data: parsed,
  };
  return action;
}

// TODO: Error Handling
export function fileLoaded(fileAsText, fileObj) {
  return (dispatch) => {
    // parse file with d3
    let parsed = d3.csvParse(fileAsText);
    // add index column to parsed file.
    parsed = Util.addIndexColumnToParsedFile(parsed);
    // dispatch file loaded and parsed event.
    dispatch(fileLoadedAndParsed(fileAsText, fileObj, parsed));
    dispatch(addDataColumnsToAttributes(parsed));
  };
}

// TODO: Error Handling
export function readFile(file) {
  return (dispatch, getState) => {
    const reader = new FileReader();

    reader.onload = () => {
      const fileAsText = reader.result;
      // read file and dispatch file loaded event.
      dispatch(fileLoaded(fileAsText, file));
    };

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");

    reader.readAsText(file);
  };
}

export function changeAttributeExpressionString(
  attributeId,
  newExprString,
  typeOfAttributeReceivingDrop
) {
  const action = {
    type: CHANGE_ATTRIBUTE_EXPRESSION_STRING,
    attributeId: attributeId,
    newExprString: newExprString,
    typeOfAttributeReceivingDrop: typeOfAttributeReceivingDrop,
  };

  return action;
}

export function updateAttributeValue(
  attributeId,
  typeOfAttributeReceivingDrop
) {
  const action = {
    type: UPDATE_ATTRIBUTE_VALUE,
    attributeId: attributeId,
    typeOfAttributeReceivingDrop: typeOfAttributeReceivingDrop,
  };

  return action;
}

// actionOccuredAtId is the id of the attribute receiving the drop
export function changeAttributeExpressionStringThunk(
  attributeId,
  newExprString,
  typeOfAttributeReceivingDrop,
  actionOccuredAtId,
  attributeIndex
) {
  return (dispatch, getState) => {
    let state = getState();
    let drawing = state.drawing;
    // for eg: attributeId: layer0$width, attributeAccessorName:"width"
    const attributeAccessorName = attributeId.split("$")[1];
    // now construct an id from the attrbute name and id of the object where the action occured for eg: layer0rect0 + "$width" = "layer0rect0$width"
    const ownAttributeId = actionOccuredAtId + "$" + attributeAccessorName;

    // check if this is an inherited attribute
    if (state["drawing"][ownAttributeId + "$name"] === undefined) {
      dispatch(
        addAttributeToOwnAttributes(
          attributeId,
          typeOfAttributeReceivingDrop,
          actionOccuredAtId,
          attributeIndex
        )
      );

      dispatch(
        changeAttributeExpressionString(
          ownAttributeId,
          state["drawing"][attributeId + "$exprString"],
          typeOfAttributeReceivingDrop
        )
      );
    }

    if (typeOfAttributeReceivingDrop === "axis") {
      const newAxisScale = ShapeUtil.updateScale(
        newExprString,
        ownAttributeId,
        drawing
      );
    }

    dispatch(
      changeAttributeExpressionString(
        ownAttributeId,
        newExprString,
        typeOfAttributeReceivingDrop
      )
    );
    dispatch(
      updateAttributeValue(ownAttributeId, typeOfAttributeReceivingDrop)
    );

    // get latest state
    state = getState();
    drawing = state.drawing;

    // update values of attributes depending on this attribute.
    dispatch(
      updateDependentsValues(ownAttributeId, typeOfAttributeReceivingDrop)
    );
  };
}

export function updateDependentsValues(attributeId) {
  const action = {
    type: UPDATE_DEPENDENTS_VALUES,
    attributeId: attributeId,
  };

  return action;
}

// actionOccuredAtId is the id of the attribute receiving the drop.
export function addAttributeReferenceToAttribute(
  editor,
  event,
  attributeId,
  droppedAttributeMonitorItem,
  typeOfAttributeReceivingDrop,
  actionOccuredAtId,
  attributeIndex
) {
  return (dispatch, getState) => {
    let state = getState();
    let drawing = state.drawing;
    // for eg: attributeId: layer0$width, attributeAccessorName:"width"
    const attributeAccessorName = attributeId.split("$")[1];
    const ownAttributeId = actionOccuredAtId + "$" + attributeAccessorName;

    // add attribute to own attributes in case this isn't one.
    if (state["drawing"][ownAttributeId + "$name"] === undefined) {
      dispatch(
        addAttributeToOwnAttributes(
          attributeId,
          typeOfAttributeReceivingDrop,
          actionOccuredAtId,
          attributeIndex
        )
      );

      dispatch(
        changeAttributeExpressionString(
          ownAttributeId,
          state["drawing"][attributeId + "$exprString"],
          typeOfAttributeReceivingDrop
        )
      );
    }

    ShapeUtil.addAttributeReferenceToAttribute(
      editor,
      event,
      ownAttributeId,
      droppedAttributeMonitorItem
    );
    const attributeExprString = editor.getValue();

    const newExprString =
      attributeExprString + droppedAttributeMonitorItem["attributeId"];

    // if the user is dropping data on an axis, initiate/update axis's scale.
    if (
      typeOfAttributeReceivingDrop === "axis" &&
      droppedAttributeMonitorItem["type"] === "data"
    ) {
      const newAxisScale = ShapeUtil.updateScale(
        newExprString,
        attributeId,
        drawing
      );
    }

    // now change attribute Expression string of *own* attribute.
    dispatch(
      changeAttributeExpressionString(
        ownAttributeId,
        newExprString,
        typeOfAttributeReceivingDrop
      )
    );
    dispatch(
      updateAttributeValue(ownAttributeId, typeOfAttributeReceivingDrop)
    );

    // get latest state
    state = getState();
    drawing = state.drawing;

    // update values of attributes depending on this attribute.
    dispatch(
      updateDependentsValues(ownAttributeId, typeOfAttributeReceivingDrop)
    );
  };
}

export function updateHoveredAttribute(hoveredAttributeId) {
  const action = {
    type: UPDATE_HOVERED_ATTRIBUTE,
    hoveredAttributeId: hoveredAttributeId,
  };

  return action;
}

export function checkIfNewLayerIsValid() {
  return (dispatch, getState) => {
    const isActiveShapeValid = ShapeUtil.checkIfNewLayerIsValid(
      getState()["drawing"]
    );

    if (!isActiveShapeValid) {
      dispatch(deleteActiveLayer());
    }
  };
}

export function deleteActiveLayer() {
  const action = {
    type: DELETE_ACTIVE_LAYER,
  };

  return action;
}

export function changeActiveLayerAndShape(shapeId) {
  const action = {
    type: CHANGE_ACTIVE_LAYER_AND_SHAPE,
    shapeId: shapeId,
  };

  return action;
}

export function addAttributeToOwnAttributes(
  attributeId,
  typeOfAttributeReceivingDrop,
  actionOccuredAtId,
  attributeIndex
) {
  const action = {
    type: ADD_ATTRIBUTE_TO_OWN_ATTRIBUTES,
    attributeId: attributeId,
    typeOfAttributeReceivingDrop: typeOfAttributeReceivingDrop,
    actionOccuredAtId: actionOccuredAtId,
    attributeIndex: attributeIndex,
  };

  return action;
}

export function loopAll() {
  return (dispatch, getState) => {
    const state = getState();
    const layerIds = state["drawing"]["layerIds"];

    layerIds.forEach((layerId) => {
      // check if this layer has the same number of shapes as rows in the data. if so, we don't need to do anything as any data attribute from the layer would automatically be updated in the shapes.
      if (
        state["drawing"][layerId + "$shapeIds"].length ===
        state["drawing"]["data"].length
      )
        return;

      // otherwise loop over this layer.
      dispatch(loopLayer(layerId));
    });
  };
}

export function loopLayer(layerId) {
  return (dispatch, getState) => {
    // to loop a layer, we first initialise the layer with as many shapes as there are rows in the data.

    const state = getState();
    const data = state.drawing.data;
    // if data is empty, do nothing.
    if (data.length === 0) {
      // do nothing
      return;
    }

    // if already looped
    if (data.length === state["drawing"][layerId + "$shapeIds"].length) {
      // do nothing
      return;
    }

    let batchedActions = [];

    // otherwise, initialise layer with as many shapes as unmatched rows in data.
    data.forEach((row, i) => {
      if (i < state["drawing"][layerId + "$shapeIds"].length) return;
      batchedActions.push(createNewShape(layerId));
    });

    dispatch(batchedActions);
  };
}
