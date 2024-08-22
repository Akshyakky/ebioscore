import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Box, Divider, Grid, IconButton, Menu, MenuItem, Tooltip, Typography, Checkbox } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AutocompleteTextBox from '../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox';
import { fetchAppointmentConsultants, fetchAllResources } from '../../../../services/FrontOfficeServices/AppointmentServices/AppointmentService';

interface SchedulerHeaderProps {
    onRefresh: () => void;
}

const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({ onRefresh }) => {
    const [searchType, setSearchType] = useState<'consultant' | 'resource'>('consultant');
    const [searchValue, setSearchValue] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [checked, setChecked] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!searchValue) {
            inputRef.current?.focus();
        }
    }, [searchValue]);

    const toggleSearchType = useCallback(() => {
        setSearchType(prevState => prevState === 'consultant' ? 'resource' : 'consultant');
        setSearchValue('');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

    const handleFetchSuggestions = useCallback(async () => {
        try {
            let result;
            if (searchType === 'consultant') {
                result = await fetchAppointmentConsultants();
            } else {
                result = await fetchAllResources();
            }

            if (result && result.success) {
                const items = result.data || [];
                setSuggestions(items.map(item => searchType === 'consultant' ? item.conFName : item.rLName));
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions", error);
            setSuggestions([]);
        }
    }, [searchType]);

    useEffect(() => {
        handleFetchSuggestions();
    }, [searchType]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }, []);

    const handleSelectSuggestion = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5' }}>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm={8} md={6}>
                    <Box display="flex" alignItems="center">
                        <AutocompleteTextBox
                            key={searchType}
                            ControlID={`Search ${searchType}`}
                            title={`Search ${searchType}`}
                            value={searchValue}
                            onChange={handleChange}
                            suggestions={suggestions}
                            onSelectSuggestion={handleSelectSuggestion}
                            placeholder={`Search ${searchType}`}
                            type='text'
                            ref={inputRef}
                            InputProps={{
                                startAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                        <Tooltip title="Set Default">
                                            <Checkbox
                                                checked={checked}
                                                onChange={handleCheckboxChange}
                                                color="primary"
                                                size="small"
                                            />
                                        </Tooltip>
                                        {searchType === 'consultant' ? <PersonIcon sx={{ mr: 1 }} /> : <DomainIcon sx={{ mr: 1 }} />}
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                            {searchType === 'consultant' ? 'Consultant' : 'Resource'}
                                        </Typography>
                                    </Box>
                                ),
                                endAdornment: (
                                    <>
                                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                        <Tooltip title={`Switch to ${searchType === 'consultant' ? 'Resource' : 'Consultant'}`}>
                                            <IconButton onClick={toggleSearchType} size="small">
                                                <SwapHorizIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ),
                            }}
                            size='small'
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={4} md={6}>
                    <Box display="flex" justifyContent="flex-end" alignItems="center">
                        <Tooltip title="Refresh">
                            <IconButton onClick={onRefresh} title="Refresh" sx={{ ml: 1 }}>
                                <RefreshIcon />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>Refresh</Typography>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Options">
                            <IconButton onClick={handleMenuClick} title="More Options">
                                <MoreVertIcon />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>Options</Typography>
                            </IconButton>
                        </Tooltip>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={handleMenuClose}>Advanced Search</MenuItem>
                            <MenuItem onClick={handleMenuClose}>Available Slots</MenuItem>
                            <MenuItem onClick={handleMenuClose}>List of Appointments</MenuItem>
                        </Menu>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SchedulerHeader;
