import React from "react";
import { FeatureInfoProps } from "../../../src/app-config.types";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Drawer,
  Grid,
  IconButton,
  Theme,
  Typography,
  useTheme,
} from "@material-ui/core";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { RiskBadge } from "app-config/components/RiskBadge";
import { makeStyles } from "@material-ui/core/styles";
import { ContactScore, RawDataEntry, RiskScore } from "app-config/models";
import { RiskRecommendation } from "./risk-recommendation/RiskRecommendation";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ContactsLowIcon from "../static/images/contacts-low.svg";
import ContactsMediumIcon from "../static/images/contacts-medium.svg";
import SymptomsLowIcon from "../static/images/symptoms-low.svg";
import { usePathPreservingQueryChange } from "app-config/components/customHistoryHooks";

const useStyles = makeStyles<Theme, { fullScreen: boolean }>((theme) => ({
  action: {
    alignSelf: "auto",
    marginTop: 0,
    marginLeft: "8px",
  },
  container: {
    maxWidth: "350px",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(90deg)",
  },
  card: {
    // TODO: Extract into theme
    "backgroundColor": "#FCFCFC",
    "position": "relative",
    "padding": theme.spacing(4, 2),
    "overflow": "visible",
    "&:last-child": {
      paddingBottom: theme.spacing(4, 2), // make the cards symmetric by removing the huge padding bottom
    },
  },

  drawerPaper: {
    width: (props) => (props.fullScreen ? "100%" : "450px"),
    maxHeight: "100%",
    overflow: "hidden",
  },
  drawerRoot: {
    display: "flex",
    justifyContent: "center",
  },
  drawerPaperAnchorBottom: {
    left: "auto",
    right: "auto",
  },
  drawerScrollContainer: {
    height: "100%",
    width: "100%",
    overflow: "auto",
  },
  recommendationsLink: {
    "textAlign": "center",
    "& p": {
      fontWeight: "bold",
      margin: theme.spacing(1, 0),
    },
    "& a": {
      padding: theme.spacing(1.4, 8),
      borderRadius: theme.shape.borderRadius * 2,
    },
  },
  centerIcon: {
    margin: "0 auto",
    display: "block",
  },
  center: {
    "display": "flex",
    "flex-flow": "column",
    "align-items": "center",
  },
  chipTop: {
    position: "absolute",
    top: -12, // half height of the badge
  },
}));

const titleByRiskScore = {
  [RiskScore.Low]: "Normales Risiko",
  [RiskScore.Medium]: "Mittleres Risiko",
  [RiskScore.High]: "Hohes Risiko",
};

export const CovMapFeatureInfo = ({ rawData }: FeatureInfoProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    recommendationsLink,
    action,
    card,
    container,
    expand,
    expandOpen,
    drawerPaper,
    drawerRoot,
    drawerPaperAnchorBottom,
    drawerScrollContainer,
    centerIcon,
    chipTop,
    center,
  } = useStyles({
    fullScreen,
  });
  const pushQueryChange = usePathPreservingQueryChange();
  const location = useLocation();

  const isExpanded: boolean = new URLSearchParams(location.search).has("expanded");

  const { locationName, IdDistrict, riskScore, contactScore, incidence } = rawData as RawDataEntry;
  const title = titleByRiskScore[riskScore];

  const cardHeader = (
    <CardHeader
      onClick={toggleExpand}
      avatar={<RiskBadge riskScore={riskScore} />}
      action={
        <IconButton
          className={`${expand} ${isExpanded ? expandOpen : ""}`}
          aria-expanded={isExpanded}
          aria-label="show more"
        >
          <ArrowForwardIosIcon />
        </IconButton>
      }
      classes={{ action }}
      title={title}
      titleTypographyProps={{ variant: "h1" }}
      subheader={locationName}
    />
  );

  const ContactsIcon = ({ score }: { score: ContactScore }) => {
    switch (score) {
      case ContactScore.Low:
        return (
          <div className={center}>
            <ContactsLowIcon />
            <Typography variant="body2">reduziert</Typography>
          </div>
        );
      case ContactScore.Medium:
        return (
          <div className={center}>
            <ContactsMediumIcon />
            <Typography variant="body2">erhöht</Typography>
          </div>
        );
      default:
        return null;
    }
  };

  const ContactBehaviorCategory = (): JSX.Element => (
    <RouterLink to="/contact-behavior" style={{ textDecoration: "none" }} aria-label="go to contacts explanation">
      <Card variant="outlined" className={card}>
        <Chip size="small" label="beta" className={chipTop} />
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item xs={8}>
            <Typography variant="h3">Kontaktverhalten der Bevölkerung</Typography>
          </Grid>
          <Grid item xs={2}>
            <ContactsIcon score={contactScore} />
          </Grid>
          <Grid item xs={2}>
            <ArrowForwardIosIcon className={centerIcon} color="action" fontSize="small" />
          </Grid>
        </Grid>
      </Card>
    </RouterLink>
  );

  const SymptomLoadCategory = (): JSX.Element => (
    <RouterLink to="/symptom-level" style={{ textDecoration: "none" }} aria-label="go to symptoms explanation">
      <Card variant="outlined" className={card}>
        <Chip size="small" label="coming soon" className={chipTop} />
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item xs={8}>
            <Typography variant="h3">Symptomlast der Bevölkerung</Typography>
          </Grid>
          <Grid item xs={2}>
            <div className={center}>
              <SymptomsLowIcon />
              <Typography variant="body2">normal</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <ArrowForwardIosIcon className={centerIcon} color="action" fontSize="small" />
          </Grid>
        </Grid>
      </Card>
    </RouterLink>
  );

  const CaseNumbersCategory = (): JSX.Element => {
    const format = new Intl.NumberFormat("de-de", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

    const incidenceDisplay = format.format(incidence);

    return (
      <RouterLink to="/rki" style={{ textDecoration: "none" }} aria-label="go to explanation">
        <Card variant="outlined" className={card}>
          <Grid container direction="row" alignItems="center" spacing={2}>
            <Grid item xs={8}>
              <Typography variant="h3">7-Tages-Inzidenz (RKI)</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography align="center">{incidenceDisplay}</Typography>
            </Grid>
            <Grid item xs={2}>
              <ArrowForwardIosIcon className={centerIcon} color="action" fontSize="small" />
            </Grid>
          </Grid>
        </Card>
      </RouterLink>
    );
  };

  const link = `/recommendations?IdDistrict=${IdDistrict}`;
  const cardContent = (
    <CardContent>
      <Grid container direction="column" spacing={2}>
        {/* TODO: Comment this back in once the risk descriptions are updated */}
        {/*<Grid item>*/}
        {/*  <Typography>{riskDescription}</Typography>*/}
        {/*</Grid>*/}
        <Grid item xs={12}>
          <RiskRecommendation contactScore={contactScore} incidence={incidence} />
        </Grid>
        <Grid item xs={12}>
          <ContactBehaviorCategory />
        </Grid>
        <Grid item xs={12}>
          <SymptomLoadCategory />
        </Grid>
        <Grid item xs={12}>
          <CaseNumbersCategory />
        </Grid>
        <Grid item className={recommendationsLink}>
          <Typography>Wie kann ich mich verhalten?</Typography>
          <Button component={RouterLink} to={link} variant="contained" color="secondary">
            Weiter
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  );

  function toggleExpand() {
    if (isExpanded) {
      pushQueryChange({ expanded: undefined });
    } else {
      pushQueryChange({ expanded: "true" });
    }
  }

  return (
    <>
      <Card className={container}>{cardHeader}</Card>

      <Drawer
        open={isExpanded}
        variant="temporary"
        anchor="bottom"
        onClose={() => pushQueryChange({ expanded: undefined })}
        classes={{ paper: drawerPaper, root: drawerRoot, paperAnchorBottom: drawerPaperAnchorBottom }}
      >
        <div className={drawerScrollContainer}>
          {cardHeader}
          {cardContent}
        </div>
      </Drawer>
    </>
  );
};
