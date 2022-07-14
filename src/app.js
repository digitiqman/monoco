const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const gtbRouter = require('./routes/gtbroutes');
const ubaRouter = require('./routes/ubaroutes');

const app = express();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1
process.env['NODE_OPTIONS'] = "--http-parser=legacy"

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(express.urlencoded({ extended : true}));
app.use(express.json());

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  } )
);

app.use('/gtb', gtbRouter);
app.use('/uba', ubaRouter);

/*start http server*/
const PORT = process.env.PORT || 6666;
app.listen(PORT, () => {
  console.warn(`monoco server listening on http://localhost:${PORT}`);
});