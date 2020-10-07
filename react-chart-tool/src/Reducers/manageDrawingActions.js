import {
  INITIALISE_LAYER_FROM_DRAG,
  UPDATE_DRAG_DRAW,
  END_DRAG_DRAW,
  CREATE_NEW_SHAPE,
  TOGGLE_CURRENT_SHAPE,
  CHANGE_ATTRIBUTE_EXPRESSION_STRING,
  ADD_ATTRIBUTE_REFERENCE_TO_ATTRIBUTE,
  UPDATE_HOVERED_ATTRIBUTE,
  DELETE_ACTIVE_LAYER,
  CHANGE_ACTIVE_LAYER_AND_SHAPE,
  UPDATE_DEPENDENTS_VALUES,
  ADD_ATTRIBUTE_TO_OWN_ATTRIBUTES,
  ADD_DATA_COLUMNS_TO_ATTRIBUTES,
  FILE_LOADED_AND_PARSED,
  UPDATE_ATTRIBUTE_VALUE
} from "../Actions/actions";
import ShapeUtil from "../Util/ShapeUtil";
import Util from "../Util/Util";
import { initialState } from "./init.js";

export function manageDrawingActions(state = initialState["drawing"], action) {
  let layerIds = state.layerIds.slice(),
      layerCount = layerIds.length,
      currentShape = state.currentShape,
      newObj = {},
      newLayerName = "",
      newLayerId = "",
      shapeIds = [],
      shapeCount = 0,
      newShapeName = "",
      newShapeId = "",
      newLayer,
      updatedLayerAttributes,
      activeLayerId,
      activeShapeId,
      attributeId,
      attributeExprString,
      newExprString,
      activeLayerShapes,
      invalidLayerIndex,
      newLayerIds,
      newActiveLayerId,
      newActiveShapeId,
      newAttributeValue,
      newDependentsValues,
      newOwnAttributes,
      newInheritedAttributes,
      attributeName,
      typeOfAttributeReceivingDrop,
      attributeIndex,
      data,
      layerToLoop,
      layerId,
      shapeType,
      newShapeIds;

  switch (action.type) {
    case INITIALISE_LAYER_FROM_DRAG:
      // newLayerFromDrag returns a layer with dimensionList. A shape is not initialised with any attributes: dimensions or styles.

      newLayer = ShapeUtil.newLayerFromDrag(currentShape, action.e);

      newLayerName = "Layer " + layerCount;
      newLayerId = "layer" + layerCount;
      layerIds.push(newLayerId);

      shapeIds = [];

      newObj = {
        beingDrawn: true,
        currentShape: currentShape,
        activeLayerId: newLayerId,
        activeShapeId: newShapeId,
        layerIds: layerIds
      };

      newObj[newLayerId + "$shapeIds"] = [];
      newObj[newLayerId + "$name"] = newLayerName;
      newObj[newLayerId + "$id"] = newLayerId;
      newObj[newLayerId + "$type"] = currentShape;
      newObj[newLayerId + "$index"] = layerCount;
      // yeah, i'm not very innovative with names.
      newObj[newLayerId + "$whatAmI"] = "layer";

      // every layer and shape has a own attributes and inherited attributes. on editing an inhertides attribute, the attribute gets shifted to own attributes.
      // attributes are both dimensions and styles.
      // so every layer and shape has an ownStyleList, inheritedStyleList, ownDimensionList and inheritedDimensionList.
      // initially, a shape has neither own dimensions not styles. it takes everything from layer.
      // a layer has both dimensions and styles.

      newObj[newLayerId + "$ownDimensionList"] = ShapeUtil.allDimensions[currentShape];
      newObj[newLayerId + "$inheritedDimensionList"] = [];
      newObj[newLayerId + "$ownStyleList"] = [];
      newObj[newLayerId + "$inheritedStyleList"] = ShapeUtil.allStyles[currentShape];

      // newObj[newShapeId + "$name"] = newShapeName;
      // newObj[newShapeId + "$id"] = newShapeId;
      // newObj[newShapeId + "$index"] = newObj[newLayerId + "$shapeIds"].length - 1;
      // newObj[newShapeId + "$type"] = currentShape;
      // newObj[newShapeId + "$layerId"] = newLayerId;
      // newObj[newShapeId + "$inheritedDimensionList"] = newLayer.dimensionList.list.slice();
      // newObj[newShapeId + "$ownDimensionList"] = [];
      // newObj[newShapeId + "$ownStyleList"] = [];
      // newObj[newShapeId + "$inheritedStyleList"] = state["overallAttributes$ownStyleList"].slice();
      // newObj[newShapeId + "$whatAmI"] = "shape";

      newObj[newLayerId + "$ownDimensionList"].forEach(attr => {
        newObj[newLayerId + "$" + attr + "$value"] = newLayer["dimensionList"][attr + "$value"];
        newObj[newLayerId + "$" + attr + "$name"] = newLayer["dimensionList"][attr + "$name"];
        newObj[newLayerId + "$" + attr + "$exprString"] = newLayer["dimensionList"][attr + "$exprString"];
      });

      return Object.assign({}, state, newObj);

    case UPDATE_DRAG_DRAW:
      if (!state.beingDrawn) return state;

      activeLayerId = state.activeLayerId;
      activeShapeId = state.activeShapeId;

      // Updates *layer* not shape. Remember, we have no initialised the shape with it's own defined attributes yet. It still takes it's attributes from the layer.
      updatedLayerAttributes = ShapeUtil.updateDragDrawShape(
        activeShapeId,
        activeLayerId,
        state,
        action.e
      );

      return Object.assign({}, state, updatedLayerAttributes);

    case CREATE_NEW_SHAPE:
      newObj = {};
      layerId = action.layerId;
      newShapeIds = state[layerId + "$shapeIds"].slice();
      shapeCount = newShapeIds.length;
      shapeType = state[layerId + "$type"];
      newShapeName = Util.toSentenceCase(shapeType) + " " + shapeCount;
      newShapeId = layerId + shapeType + shapeCount;

      newShapeIds.push(newShapeId);

      newObj[newShapeId + "$name"] = newShapeName;
      newObj[newShapeId + "$id"] = newShapeId;
      newObj[newShapeId + "$index"] = shapeCount;
      newObj[newShapeId + "$type"] = shapeType;
      newObj[newShapeId + "$layerId"] = layerId;
      newObj[newShapeId + "$inheritedDimensionList"] = ShapeUtil.allDimensions[shapeType].slice();
      newObj[newShapeId + "$ownDimensionList"] = [];
      newObj[newShapeId + "$ownStyleList"] = [];
      newObj[newShapeId + "$inheritedStyleList"] = ShapeUtil.allStyles[shapeType].slice();
      newObj[newShapeId + "$whatAmI"] = "shape";
      newObj[layerId + "$shapeIds"] = newShapeIds;
      newObj["activeShapeId"] = newShapeId;

      return Object.assign({}, state, newObj);

    case END_DRAG_DRAW:
      activeLayerId = state.activeLayerId;
      activeShapeId = state.activeShapeId;

      return Object.assign({}, state, {
        beingDrawn: false
      });

    case TOGGLE_CURRENT_SHAPE:
      return Object.assign({}, state, {
        currentShape:
          ShapeUtil.keyToShape[action.newShape] === undefined
            ? state.currentShape
            : ShapeUtil.keyToShape[action.newShape]
      });

    case CHANGE_ATTRIBUTE_EXPRESSION_STRING:
      newObj = {};
      attributeId = action.attributeId;
      newExprString = action.newExprString;

      // TODO: should we do it before or after?
      ShapeUtil.updateMarks(action.attributeId, action.newExprString, state);
      newObj[attributeId + "$exprString"] = newExprString;

      return Object.assign({}, state, newObj);

    case UPDATE_ATTRIBUTE_VALUE:
      newObj = {};
      attributeId = action.attributeId;
      if(action.typeOfAttributeReceivingDrop === "style")
      {
        newAttributeValue = state[attributeId + "$exprString"];
        newObj[attributeId + "$value"] = newAttributeValue;
      }

      else {
        newAttributeValue = ShapeUtil.getAttributeValue(action.attributeId, state);
        newObj[attributeId + "$value"] = (newAttributeValue[0] !== null) ? newAttributeValue[0] : newAttributeValue[1];
      }

      return Object.assign({}, state, newObj);


    case UPDATE_DEPENDENTS_VALUES:
      // Now also update values of all the other attributes depending on this attribute.
      newDependentsValues = ShapeUtil.updateDependentsValues(action.attributeId, state)

      return Object.assign({}, state, newDependentsValues);

    case UPDATE_HOVERED_ATTRIBUTE:
      return Object.assign({}, state, {
        hoveredAttributeId: action.hoveredAttributeId
      });

    case ADD_ATTRIBUTE_TO_OWN_ATTRIBUTES:
      // id of attribute from where this currently inherits.
      attributeId = action.attributeId;
      newObj = {};
      attributeName = attributeId.split("$")[1];
      typeOfAttributeReceivingDrop = Util.toSentenceCase(action.typeOfAttributeReceivingDrop);
      attributeIndex = action.attributeIndex;

      // check if the source of the edit action owns the attribute
      if(attributeId.split("$")[0] === action.actionOccuredAtId)
        return state

      newObj[action.actionOccuredAtId + "$own" + typeOfAttributeReceivingDrop + "List"] = state[action.actionOccuredAtId + "$own" + typeOfAttributeReceivingDrop + "List"].slice();
      newObj[action.actionOccuredAtId + "$own" + typeOfAttributeReceivingDrop + "List"].push(attributeName);
      newObj[action.actionOccuredAtId + "$inherited" + typeOfAttributeReceivingDrop + "List"] = state[action.actionOccuredAtId + "$inherited" + typeOfAttributeReceivingDrop + "List"].slice();
      newObj[action.actionOccuredAtId + "$inherited" + typeOfAttributeReceivingDrop + "List"].splice(attributeIndex, 1);

      // copy all current values to own attribute from inherited.
      newObj[action.actionOccuredAtId + "$" + attributeName + "$name"] = state[attributeId + "$name"];
      // newObj[action.actionOccuredAtId + "$" + attributeName + "$value"] = state[attributeId + "$value"];
      // newObj[action.actionOccuredAtId + "$" + attributeName + "$exprString"] = state[attributeId + "$exprString"];

      return Object.assign({}, state, newObj);
      

    case DELETE_ACTIVE_LAYER:

      // I still don't have a nice immutable way to remove all props of a layer. SO i'll just remove the layer from layerIds so it doesn't get rendered ಠ‿ಠ

      // OHH this has a nice side effect. Since I'm changing the layerIds array, the next time a layer is formed, it overwrites the previous layer's everything. So we don't get a gigantic state.

      // TODO
      // I should still clear out the own Attributes from the deleted layers and shapes though.
      activeLayerId = state["activeLayerId"];
      invalidLayerIndex = state[activeLayerId + "$index"];

      newLayerIds = layerIds.slice(0, invalidLayerIndex).concat(layerIds.slice(invalidLayerIndex + 1));
      newActiveLayerId = newLayerIds[newLayerIds.length - 1]

      if(newLayerIds.length === 0)
      {
        newActiveShapeId = undefined
      }

      else
      {
        newActiveShapeId = state[newActiveLayerId + "$shapeIds"][0];
      }

      return Object.assign({}, state, {
        layerIds: newLayerIds,
        activeLayerId: newActiveLayerId,
        activeShapeId: newActiveShapeId
      });

    case CHANGE_ACTIVE_LAYER_AND_SHAPE:
      newActiveShapeId = action.shapeId;
      newActiveLayerId = state[newActiveShapeId + "$layerId"];

      return Object.assign({}, state, {
        activeLayerId: newActiveLayerId,
        activeShapeId: newActiveShapeId
      })

    case FILE_LOADED_AND_PARSED:
      return Object.assign({}, state, {
        data: action.parsed
      })

    case ADD_DATA_COLUMNS_TO_ATTRIBUTES:
      data = action.data;
      newObj = {};

      data.columns.forEach((column, i) => {
        newObj["dataAttribute" + "$" + column + "$" + "name"] = column;
        newObj["dataAttribute" + "$" + column + "$" + "type"] = Util.columnType(data, column);
        newObj["dataAttribute" + "$" + column + "$" + "whatAmI"] = "dataAttribute";
      });

      return Object.assign({}, state, newObj);

    default:
      return state;
  }

  return state;
}
