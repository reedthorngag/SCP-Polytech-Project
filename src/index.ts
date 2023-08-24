import './preinitilization';
import './tests/run_tests';
import app from './server';
import logger from './util/logger';
import router from './router';
import mock_data from './mock_data';
import https from 'https';
import http from 'http';
import fs from 'fs';

mock_data();

// NOTE: prismaClient and authenticator are global variables, be careful not to overwrite them (declared in preinitilization.ts)

const process_port:string = process.env.PORT||"0";
const port: number = parseInt(process_port) || 443;

app.use('/api',router);

app.post('/test',(req,res)=>{
});

var privateKey = fs.readFileSync( 'privatekey.key' );
var certificate = fs.readFileSync( 'certificate.crt' );


http.createServer(app).listen(80);
https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port,()=>{logger.info(`listening on port ${port}`)});
