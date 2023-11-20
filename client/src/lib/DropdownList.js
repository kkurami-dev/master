import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function DropdownList(prop) {
  const {data, onChange} = prop;
  const classes = useStyles();
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    console.log("handleChange", event);
    onChange( event );
    setAge(event.target.value);
  };

  return (
    <div>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="DropdownList-select-outlined-label">Age</InputLabel>
        <Select
          labelId="DropdownList-select-outlined-label"
          id="DropdownList-select-outlined"
          value={age}
          onChange={handleChange}
          label="Age"
        >
          {data.map((item) => (
            <MenuItem value={item} key={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
