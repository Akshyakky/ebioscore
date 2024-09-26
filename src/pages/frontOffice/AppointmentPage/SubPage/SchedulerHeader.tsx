import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Box, Divider, Grid, IconButton, Menu, MenuItem, Tooltip, Typography, Checkbox, useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AutocompleteTextBox from '../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox';
import { AppointmentService } from '../../../../services/FrontOfficeServices/AppointmentServices/AppointmentService';
import AppointmentSearch from './AppointmentList';

interface SchedulerHeaderProps {
    onRefresh: () => void;
    onSearchSelection: (conID?: number, rlID?: number, rLotYN?: string, providerName?: string, rlName?: string) => void;
}

const SchedulerHeader: React.FC<SchedulerHeaderProps> = React.memo(({ onRefresh, onSearchSelection }) => {
    const theme = useTheme();
    const [searchType, setSearchType] = useState<'consultant' | 'resource'>('consultant');
    const [searchValue, setSearchValue] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [checked, setChecked] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<{ label: string; value: number; rLotYN?: string }[]>([]);
    const [rLotYN, setRLotYN] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleOpenSearch = () => setIsSearchOpen(true);
    const handleCloseSearch = () => setIsSearchOpen(false);

    useEffect(() => {
        if (!searchValue) {
            inputRef.current?.focus();
        }
    }, [searchValue]);

    const toggleSearchType = useCallback(() => {
        setSearchType(prevState => prevState === 'consultant' ? 'resource' : 'consultant');
        setSearchValue('');
        setSuggestions([]);
        setRLotYN(undefined);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

    const handleFetchSuggestions = useCallback(async () => {
        try {
            let result;
            if (searchType === 'consultant') {
                result = await AppointmentService.fetchAppointmentConsultants();
            } else {
                result = await AppointmentService.fetchAllResources();
            }

            if (result && result.success) {
                let items = result.data || [];
                items = items.filter(item => item.rActiveYN === 'Y');
                setSuggestions(
                    items.map(item => ({
                        label: searchType === 'consultant' ? item.conFName : item.rLName,
                        value: searchType === 'consultant' ? item.conID : item.rLID,
                        rLotYN: searchType === 'resource' ? item.rLOtYN : undefined
                    }))
                );
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
        const selectedItem = suggestions.find(s => s.label === value);
        if (selectedItem) {
            setSearchValue(selectedItem.label);
            setRLotYN(selectedItem.rLotYN);

            onSearchSelection(
                searchType === 'consultant' ? selectedItem.value : undefined,
                searchType === 'resource' ? selectedItem.value : undefined,
                selectedItem.rLotYN,
                searchType === 'consultant' ? selectedItem.label : undefined,
                searchType === 'resource' ? selectedItem.label : undefined
            );
        }
    }, [suggestions, searchType, onSearchSelection]);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    const handleClear = () => {
        setSearchValue('');
        setRLotYN(undefined);
        onSearchSelection();
    };

    const handleMenuItemClick = (action: string) => {
        switch (action) {
            case 'appointmentList':
                handleOpenSearch();
                break;
            // Add cases for other menu items as needed
            default:
                break;
        }
        handleMenuClose();
    };

    return (
        <Box>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm={8} md={6}>
                    <Box display="flex" alignItems="center">
                        <AutocompleteTextBox
                            key={searchType}
                            ControlID={`Search ${searchType}`}
                            title={`Search ${searchType}`}
                            value={searchValue}
                            onChange={handleChange}
                            suggestions={suggestions.map(s => s.label)}
                            onSelectSuggestion={handleSelectSuggestion}
                            placeholder={`Search ${searchType}`}
                            type='text'
                            ref={inputRef}
                            InputProps={{
                                startAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Tooltip title="Set Default">
                                            <Checkbox
                                                checked={checked}
                                                onChange={handleCheckboxChange}
                                                color="primary"
                                                size="small"
                                            />
                                        </Tooltip>
                                        {searchType === 'consultant' ?
                                            <PersonIcon sx={{ mr: 1, }} /> :
                                            <DomainIcon sx={{ mr: 1, }} />
                                        }
                                        <Typography variant="body2" sx={{ mr: 1, }}>
                                            {searchType === 'consultant' ? 'Consultant' : 'Resource'}
                                        </Typography>
                                    </Box>
                                ),
                                endAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {searchValue && (
                                            <IconButton
                                                aria-label="clear input"
                                                onClick={handleClear}
                                                edge="end"
                                                size="small"
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                        <Divider sx={{ height: 28, mx: 0.5 }} orientation="vertical" />
                                        <Tooltip title={`Switch to ${searchType === 'consultant' ? 'Resource' : 'Consultant'}`}>
                                            <IconButton onClick={toggleSearchType} size="small">
                                                <SwapHorizIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ),
                            }}
                            size='small'
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={4} md={6}>
                    <Box display="flex" justifyContent="flex-end" alignItems="center">
                        <Tooltip title="Refresh">
                            <IconButton onClick={onRefresh} sx={{ ml: 1 }}>
                                <RefreshIcon />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>Refresh</Typography>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Options">
                            <IconButton onClick={handleMenuClick} >
                                <MoreVertIcon />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>Options</Typography>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => handleMenuItemClick('appointmentList')}>
                                <ListAltIcon sx={{ mr: 1 }} />Appointment List
                            </MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick('waitingList')}>
                                <PeopleIcon sx={{ mr: 1 }} />Waiting Patient List
                            </MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick('availableSlots')}>
                                <EventAvailableIcon sx={{ mr: 1 }} />Available Slots
                            </MenuItem>
                            <MenuItem onClick={() => handleMenuItemClick('appointmentPrint')}>
                                <PrintIcon sx={{ mr: 1 }} />Appointment Print
                            </MenuItem>
                        </Menu>
                    </Box>
                </Grid>
            </Grid>
            <AppointmentSearch open={isSearchOpen} onClose={handleCloseSearch} />
        </Box>
    );
});

export default SchedulerHeader;