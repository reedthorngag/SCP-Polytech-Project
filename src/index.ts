import './preinitilization';
import './tests/run_tests';
import app from './server';
import logger from './util/logger';
import router from './router';
import mock_data from './mock_data';
import https from 'https';
import fs from 'fs';

mock_data();

// NOTE: prismaClient and authenticator are global variables, be careful not to overwrite them (declared in preinitilization.ts)

const process_port:string = process.env.PORT||"0";
const port: number = parseInt(process_port) || 80;

app.use('/api',router);

app.post('/test',(req,res)=>{
});

var privateKey = fs.readFileSync( 'privatekey.key' );
var certificate = fs.readFileSync( 'certificate.crt' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port,()=>{console.log(`listening on port ${port}`)});
