/**
 * 通知用のダイアログ
 */
import { useState } from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { PropTypes } from 'prop-types';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function BasicModalMain({ title, description = '' }) {
  const [open, setOpen] = useState(false);

  if (!title && title.length === 0) {
    return "";
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {description}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
BasicModalMain.defaultProps = {
  title: "",
  description: "",
};

function DefaultModal(param) {
  const {title, description} = param;
  return <BasicModalMain {...{title, description}} />;
}

BasicModalMain.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default DefaultModal;
