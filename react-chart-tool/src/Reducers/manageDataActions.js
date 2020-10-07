import { FILE_LOADED_AND_PARSED } from "../Actions/actions";
import { initialState } from "./init.js";

export function manageDataActions(state = initialState["data"], action) {
  let file;

  switch (action.type) {
    case FILE_LOADED_AND_PARSED:
      return action.parsed;

    default:
      return state
  }

  return state;
}
