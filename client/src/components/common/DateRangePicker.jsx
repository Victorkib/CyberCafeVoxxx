import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Button, Popover } from '@mui/material';

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [date, setDate] = useState({
    from: startDate,
    to: endDate,
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (range) => {
    setDate(range);
    if (range?.from && range?.to) {
      onChange({
        startDate: range.from,
        endDate: range.to,
      });
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Button
          variant="outlined"
          onClick={handleClick}
          startIcon={<Calendar size={20} />}
          sx={{ minWidth: 300, justifyContent: 'flex-start' }}
        >
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            'Pick a date range'
          )}
        </Button>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={date.from}
              onChange={(newValue) => handleSelect({ ...date, from: newValue })}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={date.to}
              onChange={(newValue) => handleSelect({ ...date, to: newValue })}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
} 