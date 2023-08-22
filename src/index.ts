import './preinitilization';
import './tests/run_tests';
import app from './server';
import logger from './util/logger';
import {router} from './router';
logger.info("what?");
import mock_data from './mock_data';

mock_data();

// NOTE: prismaClient and authenticator are global variables, be careful not to overwrite them (declared in preinitilization.ts)

const process_port:string = process.env.PORT||"0";
const port: number = parseInt(process_port) || 80;

app.use('/api',router);

app.post('/test',(req,res)=>{
});

app.listen(port,()=>logger.info(`Listening on port ${port}`));
