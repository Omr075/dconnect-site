const express = require("express");
const app = express();

app.use(express.json());


const pingRoute = require("./api/ping");

app.use("/render", pingRoute);

app.use(express.static(__dirname));



const musicRoute =
    require("./api/music");

const authRoute =
    require("./api/auth");

const reviews =
require("./api/reviews");

const adminReviews =
require("./api/admin-reviews");

const notificationsRoute =
require("./api/notifications");

const adminAutomation =
require("./api/admin-automation");

const automationRoute =
require("./api/automation");


app.use(
"/api/automation",
automationRoute
);



app.use(
    "/api/admin",
    adminAutomation
);


app.use(
"/api/notifications",
notificationsRoute
);


app.use(
"/api/admin",
adminReviews
);


app.use(
"/api",
reviews
);

app.use(
    "/api/music",
    musicRoute
);

app.use(
    "/api/auth",
    authRoute
);



const userRoute =
require("./api/user");


app.use(
    "/api/user",
    userRoute
);

const aiRoute =
    require("./api/ai");

app.use(
    "/api/ai",
    aiRoute
);

const adminRoute =
    require("./api/admin");


app.use(
    "/api/admin",
    adminRoute
);

const adminStats =
    require("./api/admin-stats")

app.use(
    "/api/admin",
    adminStats
);
const adminUsers =
require("./api/admin-users");

app.use(
    "/api/admin",
    adminUsers
);

app.listen(8080, () => {

    console.log(
        "Site Online"
    );

});
