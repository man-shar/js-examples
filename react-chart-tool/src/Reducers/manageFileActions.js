import { FILE_LOADED_AND_PARSED } from "../Actions/actions";
import { initialState } from "./init.js";

export function manageFileActions(state = initialState["file"], action) {
  let file;

  switch (action.type) {
    case FILE_LOADED_AND_PARSED:

      return Object.assign({}, state, {
          fileAsText: action.fileAsText,
          fileObj: action.fileObj,
          parsed: action.parsed,
          isLoaded: true,
      });

    default:
      return state
  }

  return state;
}