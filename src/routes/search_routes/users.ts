import Route from "../../types/route";

const search_users:Route = ['/search/users','GET','none', async (req:any,res:any) => {

    if (!req.query.param) {
        res.status(404).send('missing search parameter (?param=)');
        return;
    }

}];


const routeList:Route[] = [
    search_users
]

export default routeList;