import Route from '../../types/route';
import bcrypt from 'bcrypt';

const signup:Route = ['/signup','POST','optional', async (req:any,res:any) => {
    if (req.auth || !req.body.email || !req.body.password) {
        res.redirect('/');
        return;
    }

    
}];


const routeList:Route[] = [
    signup,
]

export default routeList;