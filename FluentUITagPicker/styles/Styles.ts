import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({

  tagPickerContainer: {
    paddingTop: '3px',
    minWidth: '200px',
    //maxWidth: '400px',  // todo parametrize ??
  },
  tagPickerControl: {
    paddingLeft: '3px',
  },
  tagPickerGroup: {
    padding: '0 0 0 0',
  },
  tagPickerInput: {
   padding: '0 0 0 0'
  },
  tagPickerOption : {
    display: 'flex',
    alignItems: 'center' /* This centers the content vertically */
  },

  elementVisible: {
    visibility: 'visible'
  },
  elementHidden: {
    visibility: 'hidden',
    display: 'none'     // gives back the space
  },

  tagOverflow: {
    whiteSpace: 'nowrap', /* Prevents the text from wrapping to the next line */
    overflow: 'hidden', /* Hides the overflow text */
    textOverflow: 'ellipsis', /* Adds an ellipsis to indicate text cut off */
  },
  icon12: {
    fontSize: '12px'
  }

});