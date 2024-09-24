import { Box, Grid, Paper } from "@mui/material"
import ManageBedDetails from "../SubPage/ManageBedDetails";

const ManageBedPage: React.FC = () => {
    return (


        <Box >
            <Grid container spacing={1}>
                <Paper elevation={4} sx={{ height: '100%', p: 1 }}>
                    <ManageBedDetails />
                </Paper>
            </Grid>

        </Box >


    )
}
export default ManageBedPage