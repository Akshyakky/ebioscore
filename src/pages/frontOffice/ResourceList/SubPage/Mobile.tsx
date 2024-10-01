import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
    TextField,
    Button,
    Grid,
    Paper,
    Typography,
    InputAdornment,
} from '@mui/material';
import {
    CreditCard as AadharIcon,
    KeyRound as OtpIcon,
    Phone as PhoneIcon,
} from 'lucide-react';

const AadharOtpForm = () => {
    const [aadharNumber, setAadharNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const handleAadharChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAadharNumber(e.target.value);
    };

    const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const handleSendOtp = () => {
        // Simulating OTP sending process
        console.log('Sending OTP for Aadhar:', aadharNumber);
        setIsOtpSent(true);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted:', { aadharNumber, otp, phoneNumber });
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Aadhar Verification
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Aadhar Number"
                            variant="outlined"
                            value={aadharNumber}
                            onChange={handleAadharChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AadharIcon size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="OTP"
                            variant="outlined"
                            value={otp}
                            onChange={handleOtpChange}
                            disabled={!isOtpSent}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <OtpIcon size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            variant="outlined"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            disabled={!isOtpSent}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={isOtpSent ? undefined : handleSendOtp}
                            type={isOtpSent ? "submit" : "button"}
                        >
                            {isOtpSent ? 'Submit' : 'Send OTP'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AadharOtpForm;