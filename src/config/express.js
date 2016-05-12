import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import db from './db'; // eslint-disable-line
import cors from 'cors';
import boolParser from 'express-query-boolean';

// import routes
import routerSurvivors from '../modules/survivors/api/routes';

const app = express();

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(boolParser());

app.use(methodOverride());



const api = {};
api.survivors = routerSurvivors;


app.use('/api/survivors', api.survivors);



// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => { // eslint-disable-line
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

export default app;
