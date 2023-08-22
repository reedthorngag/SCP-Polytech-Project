import Route from '../../types/route';
import bcrypt from 'bcryptjs';

const signup:Route = ['/signup','POST','optional', async (req:any,res:any) => {
    if (req.auth || !req.body.email || !req.body.password) {
        res.redirect('/');
        return;
    }

    /**
     * params:
     *    name
     *    email
     *    displayName
     *    dob (date of birth)
     *    password
     */

    if (!(req.body.name && req.body.email && req.body.displayName && req.body.dob && req.body.password)) {
        res.redirect('/');
        return;
    }

    try {

        if (await prismaClient.loginInfo.findUnique({where:{Email:req.body.email}})) {
            res.status(200).contentType('json').send('{"status":"failed","reason":"email_in_use"}');
            return;
        }

        if (await prismaClient.user.findUnique({where:{DisplayName:req.body.displayName}})) {
            res.status(200).contentType('json').send('{"status":"failed","reason":"display_name_unavailable"}');
            return;
        }

        const user = await prismaClient.user.create({
            data: {
                Name: req.body.name,
                DisplayName: req.body.displayName,
                Dob: new Date(req.body.dob).toISOString(),
                IsAdmin: false
            }
        });

        await prismaClient.loginInfo.create({
            data: {
                Email: req.body.email,
                Password: bcrypt.hashSync(req.body.password,12),
                UserID: user.UserID,
                IsAdmin: false
            }
        });

        res.status(200).contentType('json').send('{"status":"success"}');

    } catch (error:any) {
        throw error;
    }
}];

const checkDisplayName:Route = ['/signup/available', 'GET', 'none', async (req:any,res:any) => {

    if (!req.query.name) {
        res.redirect('/');
        return;
    }

    if (await prismaClient.user.findUnique({where:{DisplayName:req.query.name}})) {
        res.status(451).send('Display name taken!');
        return;
    }

    res.status(200).send();
    return;
}];


const routeList:Route[] = [
    signup,
    checkDisplayName
]

export default routeList;