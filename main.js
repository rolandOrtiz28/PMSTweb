const dotenv = require('dotenv').config({ override: true });
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoDBStore = require("connect-mongo");



const articleRoute = require('./routes/article');
const userRoute = require('./routes/user');
const serviceRoute = require('./routes/Services');
const teamRoute = require('./routes/team');
const csrRoute = require('./routes/csr');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/pmst'


mongoose.connect(dbUrl, {
    // useNewUrlParser: true,
    // // useCreateIndex: true,
    // useUnifiedTopology: true

});

app.use(express.static(path.join(__dirname, 'public')));

const db = mongoose.connection;
db.on("error", console.error.bind(console, " connection error:"));
db.once("open", () => {
    console.log("Database Connected");
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());



const secret = process.env.PMST_SECRET
const sessionConfig = {
    secret,
    name: '_mgSoad',
    resave: false,
    saveUninitialized: true,
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600 // time period in seconds
    }),
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
    "https://cdn.ckeditor.com/",
    "https://cdnjs.cloudflare.com/",
    "https://ionic.io/ionicons/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://www.google-analytics.com",
    "https://code.jquery.com/",
    "https://unpkg.com/",
    "https://cdn.ckeditor.com/",

];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
    "https://getbootstrap.com/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://ionic.io/ionicons/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://unpkg.com/",
    "https://cdn.ckeditor.com/"

];
const connectSrcUrls = [
    "https://unsplash.com/",
    "https://pdf-converter.cke-cs.com",
    "https://cdnjs.cloudflare.com/",
    "https://ionic.io/ionicons/",
    "https://unpkg.com/",

];
const fontSrcUrls = [
    "https://ionic.io/ionicons/",
    "https://fonts.gstatic.com/",
    "https://cdnjs.cloudflare.com/",

];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            formAction: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            mediaSrc: ["'self'"],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
                "https://i.pinimg.com/564x/6c/bf/00/6cbf00a772725add422adf6bb976f6ba.jpg",
                "https://media.istockphoto.com/",
                "https://img.icons8.com/ios-glyphs/256/phone-disconnected.png",
                "cdn.ckeditor.com",



            ],
            fontSrc: ["'self'", "'<URL>'", ...fontSrcUrls],
        },
    })
);




app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();

})





//routes
app.get('/', (req, res) => {
    res.render('home')
})


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views.html')
})
//services route
app.use('/', serviceRoute)

//article route
app.use('/articles', articleRoute)

// admin route
app.use('/', userRoute)



//team route
app.use('/', teamRoute)

//csr route
app.use('/csr', csrRoute)










//error route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!';
    res.status(statusCode).render('error', { err });
});







//channel
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on PORT:${port}`)
})