import Route from "../../types/route";

const search_communities:Route = ['/search/communities','GET','none', async (req:any,res:any) => {

    if (!req.query.param) {
        res.status(404).send('missing search parameter (?param=)');
        return;
    }

    const number = parseInt(req.query.skip);

    const communities = await prismaClient.community.findMany({
        skip: !!number && number>0 ? number : 0,
        take: 10,
        orderBy: {
            _relevance: {
                fields: ['Name','Description'],
                search: req.query.param,
                sort: 'asc'
            }
        },
        select: {
            Name: true,
            Description: true,
            CommunityID: true,
            Population: true
        }
    });

    res.status(200).contentType('json').send(JSON.stringify(communities));

}];


const routeList:Route[] = [
    search_communities
]

export default routeList;