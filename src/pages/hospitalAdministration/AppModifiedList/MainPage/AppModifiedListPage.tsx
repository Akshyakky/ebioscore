import { Divider, Grid, Typography } from "@mui/material";
import { Suspense } from "react";
import { Loader } from "lucide-react";
import AppModifiedDetails from "../SubPage/AppModifiedListDetails";
const AppModifiedListPage: React.FC = () => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          App Modified Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Suspense fallback={<Loader type="skeleton" />}>
          <AppModifiedDetails />
        </Suspense>
      </Grid>
    </Grid>
  );
};
export default AppModifiedListPage;
